import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Prisma } from 'src/generated/prisma/client'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateRecurringDto } from './dtos/create-recurring.dto'
import { UpdateRecurringDto } from './dtos/update-recurring.dto'

@Injectable()
export class RecurringService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateRecurringDto, userId: string) {
		const {
			type,
			description,
			monthDay,
			frequency,
			categoryId,
			paymentMethod,
			cardId,
			bankAccountId,
			startDate,
			endDate,
		} = dto

		if (dto.amount <= 0)
			throw new BadRequestException('Amount must be greater than 0')
		const amount = new Prisma.Decimal(dto.amount)

		if (cardId) {
			const card = await this.prisma.card.findFirst({
				where: { id: cardId, userId },
				select: { id: true },
			})

			if (!card) throw new ForbiddenException('Card does not belong to user')
		}

		const category = await this.prisma.category.findFirst({
			where: {
				id: categoryId,
				OR: [{ isDefault: true }, { userId }],
			},
			select: { id: true },
		})

		if (!category) throw new ForbiddenException('Category not found')

		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: { id: bankAccountId, userId },
			select: { id: true },
		})

		if (!bankAccount) throw new ForbiddenException('Account not found')

		return this.prisma.$transaction(async (tx) => {
			const recurring = await tx.recurring.create({
				data: {
					type,
					description,
					amount,
					monthDay,
					frequency,
					paymentMethod,
					...(cardId && { card: { connect: { id: cardId } } }),
					bankAccount: { connect: { id: bankAccountId } },
					category: { connect: { id: categoryId } },
					startDate,
					endDate,
				},
			})

			// generate transaction if monthDay === today
			const today = new Date()
			const shouldGenerate =
				monthDay === today.getDate() && new Date(startDate) <= today

			if (shouldGenerate) {
				const balanceChange =
					type === 'INCOME' ? Number(amount) : -Number(amount)

				await tx.transaction.create({
					data: {
						title: description,
						type,
						amount,
						date: today,
						isPaid: true,
						recurring: { connect: { id: recurring.id } },
						bankAccount: { connect: { id: bankAccountId } },
						category: { connect: { id: categoryId } },
						...(cardId && { card: { connect: { id: cardId } } }),
					},
				})

				await tx.bankAccount.update({
					where: { id: bankAccountId },
					data: { balance: { increment: balanceChange } },
				})

				await tx.recurring.update({
					where: { id: recurring.id },
					data: { lastGeneratedAt: today },
				})
			}

			return recurring
		})
	}

	async findAll(userId: string) {
		const userAccounts = await this.prisma.bankAccount.findMany({
			where: { userId },
			select: { id: true },
		})

		const accountIds = userAccounts.map((a) => a.id)

		const recurrings = await this.prisma.recurring.findMany({
			where: {
				bankAccountId: { in: accountIds },
			},
			orderBy: { createdAt: 'desc' },
			include: {
				category: {
					select: { id: true, title: true, type: true },
				},
			},
		})

		return { recurrings, total: recurrings.length }
	}

	async update(recurringId: string, userId: string, dto: UpdateRecurringDto) {
		if (dto.bankAccountId) {
			const bankAccount = await this.prisma.bankAccount.findFirst({
				where: { id: dto.bankAccountId, userId },
				select: { id: true },
			})

			if (!bankAccount)
				throw new ForbiddenException('Account does not belong to user')
		}

		const recurring = await this.prisma.recurring.findFirst({
			where: { id: recurringId },
		})

		if (!recurring)
			throw new NotFoundException('Recurring transaction not found')

		const amount = dto.amount ? new Prisma.Decimal(dto.amount) : undefined

		return this.prisma.recurring.update({
			where: { id: recurringId },
			data: {
				...dto,
				amount,
			},
		})
	}

	async delete(
		recurringId: string,
		userId: string,
		deleteTransactions = false,
	) {
		const recurring = await this.prisma.recurring.findFirst({
			where: {
				id: recurringId,
				bankAccount: { userId },
			},
		})

		if (!recurring)
			throw new NotFoundException('Recurring transaction not found')

		if (deleteTransactions) {
			const transactions = await this.prisma.transaction.findMany({
				where: { recurringId },
				select: { id: true, type: true, amount: true, bankAccountId: true },
			})

			await this.prisma.$transaction(async (tx) => {
				// reverse balance
				for (const t of transactions) {
					const reverseAmount =
						t.type === 'INCOME' ? -Number(t.amount) : Number(t.amount)

					await tx.bankAccount.update({
						where: { id: t.bankAccountId },
						data: { balance: { increment: reverseAmount } },
					})
				}

				await tx.transaction.deleteMany({ where: { recurringId } })
				await tx.recurring.delete({ where: { id: recurringId } })
			})
		} else {
			// transactions stay, recurringId stay null (onDelete:)
			await this.prisma.recurring.delete({ where: { id: recurringId } })
		}

		return { message: 'Recurring transaction deleted successfully' }
	}
}
