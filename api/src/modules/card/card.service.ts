import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateCardDto } from './dtos/create-card.dto'
import { UpdateCardDto } from './dtos/update-card.dto'

@Injectable()
export class CardService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateCardDto, userId: string) {
		const {
			name,
			color,
			type,
			lastFour,
			expirationDate,
			cvc,
			creditLimit,
			closingDay,
			dueDay,
			bankAccountId,
		} = data

		// Validate that the bank account belongs to the user
		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: {
				id: bankAccountId,
				userId,
			},
		})

		if (!bankAccount) {
			throw new BadRequestException('Bank account not found or unauthorized')
		}

		const card = await this.prisma.card.create({
			data: {
				name,
				color,
				type,
				lastFour,
				expirationDate,
				cvc,
				creditLimit,
				closingDay,
				dueDay,
				userId,
				bankAccountId,
			},
		})

		return card
	}

	async findAll(userId: string, bankAccountId?: string) {
		const cards = await this.prisma.card.findMany({
			where: {
				userId,
				...(bankAccountId && { bankAccountId }),
			},
			include: {
				bankAccount: { select: { name: true } },
			},
		})

		return {
			cards,
			total: cards.length,
		}
	}

	async findOne(cardId: string, userId: string) {
		const card = await this.prisma.card.findFirst({
			where: {
				id: cardId,
				userId,
			},
			include: {
				bankAccount: { select: { name: true } },
			},
		})

		if (!card) throw new NotFoundException('Card not found')

		return card
	}

	async updateById(cardId: string, userId: string, data: UpdateCardDto) {
		// check if card is own userId
		const card = await this.prisma.card.findFirst({
			where: {
				id: cardId,
				userId,
			},
		})

		if (!card) throw new NotFoundException('Card not found')

		// update card
		const updatedCard = await this.prisma.card.update({
			where: {
				id: cardId,
			},
			data,
		})

		return updatedCard
	}

	async delete(id: string) {
		await this.prisma.card.delete({
			where: { id },
		})

		return {
			message: 'Card deleted successfully',
			success: true,
		}
	}

	async monthlyExpenses(cardId: string, startMonth: string, endMonth: string) {
		const total = await this.prisma.transaction.aggregate({
			where: {
				cardId,
				type: 'EXPENSE',
				date: {
					gte: new Date(startMonth),
					lte: new Date(endMonth),
				},
			},
			_sum: {
				amount: true,
			},
		})

		return total
	}

	async getRecentTransactions(cardId: string, limit = 5) {
		const transactions = await this.prisma.transaction.findMany({
			where: { cardId },
			orderBy: { date: 'desc' },
			take: limit,
			include: {
				category: {
					select: { id: true, title: true, type: true, icon: true },
				},
			},
		})

		return transactions.map((tx) => ({
			id: tx.id,
			title: tx.title,
			type: tx.type,
			amount: Number(tx.amount),
			date: tx.date,
			category: tx.category,
		}))
	}

	async getCashflow(cardId: string) {
		const now = new Date()
		const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

		const transactions = await this.prisma.transaction.findMany({
			where: {
				cardId,
				date: { gte: sixMonthsAgo },
			},
			select: { type: true, amount: true, date: true },
		})

		// Build monthly totals for last 6 months
		const monthlyData = new Map<string, { income: number; expense: number }>()

		for (let i = 0; i < 6; i++) {
			const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
			const key = `${d.getFullYear()}-${d.getMonth() + 1}`
			monthlyData.set(key, { income: 0, expense: 0 })
		}

		for (const tx of transactions) {
			const date = new Date(tx.date)
			const key = `${date.getFullYear()}-${date.getMonth() + 1}`
			const entry = monthlyData.get(key)
			if (!entry) continue

			const amount = Number(tx.amount)
			if (tx.type === 'INCOME') {
				entry.income += amount
			} else {
				entry.expense += amount
			}
		}

		return {
			data: Array.from(monthlyData.entries()).map(([key, values]) => {
				const [year, month] = key.split('-').map(Number)
				return { month, year, ...values }
			}),
		}
	}
}
