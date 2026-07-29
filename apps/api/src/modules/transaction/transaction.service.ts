import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'

import { Prisma, type Transaction } from 'src/generated/prisma/client'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { PaginatedResult } from './dtos/paginated-result.dto'
import { QueryTransactionDto } from './dtos/query-transaction.dto'
import { UpdateTransactionDto } from './dtos/update-transaction.dto'

@Injectable()
export class TransactionService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService,
	) {}

	async create(dto: CreateTransactionDto, userId: string) {
		const { title, type, date, isPaid, bankAccountId, cardId, categoryId } = dto

		// validate amount > 0
		if (dto.amount <= 0)
			throw new BadRequestException('Amount must be greater than 0')

		// validate date is not in the future
		if (new Date(date) > new Date())
			throw new BadRequestException('Date cannot be in the future')

		// converts number to decimal
		const amount = new Prisma.Decimal(dto.amount)

		// validate user card (optional)
		if (cardId) {
			const card = await this.prisma.card.findFirst({
				where: { id: cardId, userId },
				select: { id: true },
			})

			if (!card) throw new ForbiddenException('Card does not belong to user')
		}

		// validate category
		const category = await this.prisma.category.findFirst({
			where: {
				id: categoryId,
				OR: [{ isDefault: true }, { userId: userId }],
			},
			select: { id: true },
		})

		if (!category) throw new NotFoundException('Category not found')

		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: { id: bankAccountId, userId },
			select: { id: true },
		})

		if (!bankAccount) throw new NotFoundException('Account not found')

		const transaction = await this.prisma.$transaction(async (tx) => {
			const created = await tx.transaction.create({
				data: {
					title,
					type,
					amount,
					date,
					isPaid,
					...(cardId && { card: { connect: { id: cardId } } }),
					bankAccount: { connect: { id: bankAccountId } },
					category: { connect: { id: categoryId } },
				},
			})

			// update balance
			await tx.bankAccount.update({
				where: { id: bankAccountId },
				data: {
					balance: {
						increment: type === 'INCOME' ? amount : -Number(amount),
					},
				},
			})
			return created
		})

		this.fireNotificationChecks(userId, categoryId, new Date(date))
		return transaction
	}

	async findAll(
		dto: QueryTransactionDto,
		userId: string,
	): Promise<PaginatedResult<Transaction>> {
		const {
			cardId,
			accountId,
			categoryId,
			type,
			source,
			startDate,
			endDate,
			page = 1,
			limit = 20,
		} = dto

		// search for user bank accounts
		const userAccounts = await this.prisma.bankAccount.findMany({
			where: { userId },
			select: { id: true },
		})

		// handle edge case when user has no bank accounts
		if (userAccounts.length === 0) {
			return {
				data: [],
				meta: {
					total: 0,
					lastPage: 0,
					currentPage: page,
					perPage: limit,
					prev: null,
					next: null,
				},
			}
		}

		const accountIds = userAccounts.map((account) => account.id)

		// builds dynamically filter
		const where: Prisma.TransactionWhereInput = {
			bankAccountId: { in: accountIds },
		}

		if (cardId) where.cardId = cardId
		if (categoryId) where.categoryId = categoryId
		if (type) where.type = type
		if (accountId) where.bankAccountId = accountId
		if (source) where.source = source

		// date filters
		if (startDate || endDate) {
			where.date = {}
			if (startDate) where.date.gte = new Date(startDate) // greater than or equal
			if (endDate) where.date.lte = new Date(endDate) // less than or equal
		}

		// count total of register for pagination
		const total = await this.prisma.transaction.count({ where })

		// find data for pagination
		const data = await this.prisma.transaction.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
			include: {
				card: {
					select: { id: true, name: true },
				},
				category: {
					select: { id: true, title: true, type: true },
				},
				bankAccount: {
					select: { id: true, name: true },
				},
				recurring: {
					select: { id: true, description: true },
				},
			},
		})

		// calculate metadata
		// Math.ceil() -> rounds a given number up to the nearest integer
		const lastPage = Math.ceil(total / limit)
		const prev = page > 1 ? page - 1 : null
		const next = page < lastPage ? page + 1 : null

		return {
			data,
			meta: {
				total,
				lastPage,
				currentPage: page,
				perPage: limit,
				prev,
				next,
			},
		}
	}

	async findOne(transactionId: string, userId: string) {
		const userAccounts = await this.prisma.bankAccount.findMany({
			where: { userId },
			select: { id: true },
		})

		const accountIds = userAccounts.map((a) => a.id)

		const transaction = await this.prisma.transaction.findFirst({
			where: {
				id: transactionId,
				bankAccountId: { in: accountIds },
			},
			include: {
				card: {
					select: { id: true, name: true },
				},
				category: {
					select: { id: true, title: true, type: true },
				},
				bankAccount: {
					select: { id: true, name: true, balance: true },
				},
				recurring: {
					select: { id: true, description: true },
				},
			},
		})

		if (!transaction) throw new NotFoundException('Transaction not found')

		return transaction
	}

	async update(
		transactionId: string,
		userId: string,
		dto: UpdateTransactionDto,
	) {
		// validate card belongs to user (optional)
		if (dto.cardId) {
			const card = await this.prisma.card.findFirst({
				where: { id: dto.cardId, userId },
				select: { id: true },
			})

			if (!card) throw new ForbiddenException('Card does not belong to user')
		}

		if (dto.bankAccountId) {
			const bankAccount = await this.prisma.bankAccount.findFirst({
				where: { id: dto.bankAccountId, userId },
				select: { id: true },
			})

			if (!bankAccount)
				throw new ForbiddenException('Account does not belong to user')
		}

		const oldTransaction = await this.prisma.transaction.findFirst({
			where: { id: transactionId },
		})

		if (!oldTransaction) throw new NotFoundException('Transaction not found')

		// Block editing protected fields on Open Banking transactions
		if (oldTransaction.source === 'OPEN_BANKING') {
			if (
				dto.amount !== undefined ||
				dto.date !== undefined ||
				dto.type !== undefined
			) {
				throw new BadRequestException(
					'Cannot edit amount, date or type of a bank-synced transaction.',
				)
			}
		}

		const amount = dto.amount ? new Prisma.Decimal(dto.amount) : undefined

		const updated = await this.prisma.$transaction(async (tx) => {
			// reverse old transaction balance
			const oldReverse =
				oldTransaction.type === 'INCOME'
					? -Number(oldTransaction.amount)
					: Number(oldTransaction.amount)

			await tx.bankAccount.update({
				where: { id: oldTransaction.bankAccountId },
				data: { balance: { increment: oldReverse } },
			})

			const result = await tx.transaction.update({
				where: { id: transactionId },
				data: { ...dto, amount },
			})

			// apply new balance
			const newType = dto.type ?? oldTransaction.type
			const newAmount = amount ?? oldTransaction.amount
			const newChange =
				newType === 'INCOME' ? Number(newAmount) : -Number(newAmount)

			await tx.bankAccount.update({
				where: { id: result.bankAccountId },
				data: { balance: { increment: newChange } },
			})

			return result
		})

		const categoryId = updated.categoryId ?? oldTransaction.categoryId
		const txDate = updated.date ?? oldTransaction.date
		this.fireNotificationChecks(userId, categoryId, new Date(txDate))
		return updated
	}

	async delete(transactionId: string, userId: string) {
		const transaction = await this.prisma.transaction.findFirst({
			where: { id: transactionId },
			include: {
				card: {
					select: { id: true, userId: true },
				},
				bankAccount: {
					select: { id: true, userId: true, name: true, balance: true },
				},
			},
		})

		if (!transaction) throw new NotFoundException('Transaction not found')

		if (transaction.bankAccount.userId !== userId)
			throw new ForbiddenException('You cannot delete this transaction')

		// Block deletion of Open Banking transactions
		if (transaction.source === 'OPEN_BANKING') {
			throw new BadRequestException(
				'Cannot delete a bank-synced transaction. It represents real bank data.',
			)
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.transaction.delete({ where: { id: transactionId } })

			// reverse the action
			const reverseAmount =
				transaction.type === 'INCOME'
					? -Number(transaction.amount)
					: Number(transaction.amount)

			await tx.bankAccount.update({
				where: { id: transaction.bankAccountId },
				data: { balance: { increment: reverseAmount } },
			})
		})

		this.fireNotificationChecks(
			userId,
			transaction.categoryId,
			new Date(transaction.date),
		)
		return { message: 'Transaction deleted successfully' }
	}

	private fireNotificationChecks(
		userId: string,
		categoryId: string,
		date: Date,
	) {
		this.notificationService.checkBudgetThresholds(userId, date).catch(() => {})
		this.notificationService
			.checkSpendingLimitGoals(userId, categoryId, date)
			.catch(() => {})
	}
}
