import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Type } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateBankAccountDto } from './dtos/create-bank-account.dto'
import { UpdateBankAccountDto } from './dtos/update-bank-account.dto'

@Injectable()
export class BankAccountService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateBankAccountDto, userId: string) {
		const { name, type, balance } = data

		const bankAccount = this.prisma.bankAccount.create({
			data: {
				name,
				type,
				balance,
				initialBalance: balance,
				userId,
			},
		})

		return bankAccount
	}

	async findAll(userId: string) {
		const [bankAccounts, aggregation] = await Promise.all([
			this.prisma.bankAccount.findMany({
				where: { userId },
			}),
			this.prisma.bankAccount.aggregate({
				where: {
					userId,
				},
				_sum: {
					balance: true,
				},
				_count: {
					id: true,
				},
			}),
		])

		return {
			data: bankAccounts,
			total: aggregation._sum.balance ?? 0,
			count: aggregation._count.id,
		}
	}

	async findOne(cardId: string, userId: string) {
		const [bankAccount, transferCount, transactionCount] = await Promise.all([
			this.prisma.bankAccount.findFirst({
				where: {
					id: cardId,
					userId,
				},
			}),

			this.prisma.transfer.count({
				where: {
					OR: [{ fromAccountId: cardId }, { toAccountId: cardId }],
				},
			}),

			this.prisma.transaction.count({
				where: {
					bankAccountId: cardId,
				},
			}),
		])

		if (!bankAccount) throw new NotFoundException('Bank account not found')

		return {
			...bankAccount,
			totalMovements: transferCount + transactionCount,
		}
	}

	async update(
		bankAccountId: string,
		userId: string,
		data: UpdateBankAccountDto,
	) {
		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: {
				id: bankAccountId,
				userId,
			},
		})

		if (!bankAccount) throw new NotFoundException('Bank account not found')

		const updatedBankAccount = await this.prisma.bankAccount.update({
			where: {
				id: bankAccountId,
			},
			data,
		})

		return updatedBankAccount
	}

	async delete(id: string) {
		// Check if there are cards linked to this bank account
		const cardsCount = await this.prisma.card.count({
			where: { bankAccountId: id },
		})

		if (cardsCount > 0) {
			throw new BadRequestException(
				`Cannot delete bank account. There are ${cardsCount} card(s) linked to it.`,
			)
		}

		await this.prisma.bankAccount.delete({
			where: { id },
		})

		return {
			message: 'Bank account deleted successfully',
			success: true,
		}
	}

	async getBalanceHistory(accountId: string, userId: string) {
		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: { id: accountId, userId },
		})

		if (!bankAccount) throw new NotFoundException('Bank account not found')

		const now = new Date()
		const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

		const [transactions, transfersFrom, transfersTo] = await Promise.all([
			this.prisma.transaction.findMany({
				where: {
					bankAccountId: accountId,
					date: { gte: sixMonthsAgo },
				},
				select: { type: true, amount: true, date: true },
			}),
			this.prisma.transfer.findMany({
				where: {
					fromAccountId: accountId,
					status: 'COMPLETED',
					date: { gte: sixMonthsAgo },
				},
				select: { amount: true, date: true },
			}),
			this.prisma.transfer.findMany({
				where: {
					toAccountId: accountId,
					status: 'COMPLETED',
					date: { gte: sixMonthsAgo },
				},
				select: { amount: true, date: true },
			}),
		])

		// Build monthly net changes
		const monthlyChanges = new Map<string, number>()

		// Generate all 6 month keys
		for (let i = 0; i < 6; i++) {
			const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
			const key = `${d.getFullYear()}-${d.getMonth()}`
			monthlyChanges.set(key, 0)
		}

		// Aggregate transactions
		for (const tx of transactions) {
			const key = `${tx.date.getFullYear()}-${tx.date.getMonth()}`
			const current = monthlyChanges.get(key) ?? 0
			const amount = Number(tx.amount)
			monthlyChanges.set(
				key,
				current + (tx.type === Type.INCOME ? amount : -amount),
			)
		}

		// Aggregate outgoing transfers
		for (const t of transfersFrom) {
			const key = `${t.date.getFullYear()}-${t.date.getMonth()}`
			const current = monthlyChanges.get(key) ?? 0
			monthlyChanges.set(key, current - Number(t.amount))
		}

		// Aggregate incoming transfers
		for (const t of transfersTo) {
			const key = `${t.date.getFullYear()}-${t.date.getMonth()}`
			const current = monthlyChanges.get(key) ?? 0
			monthlyChanges.set(key, current + Number(t.amount))
		}

		// Calculate cumulative balance from initialBalance
		let runningBalance = Number(bankAccount.initialBalance)

		// Sum all changes BEFORE the 6-month window
		const priorTransactions = await this.prisma.transaction.findMany({
			where: {
				bankAccountId: accountId,
				date: { lt: sixMonthsAgo },
			},
			select: { type: true, amount: true },
		})

		for (const tx of priorTransactions) {
			const amount = Number(tx.amount)
			runningBalance += tx.type === Type.INCOME ? amount : -amount
		}

		const [priorTransfersFrom, priorTransfersTo] = await Promise.all([
			this.prisma.transfer.aggregate({
				where: {
					fromAccountId: accountId,
					status: 'COMPLETED',
					date: { lt: sixMonthsAgo },
				},
				_sum: { amount: true },
			}),
			this.prisma.transfer.aggregate({
				where: {
					toAccountId: accountId,
					status: 'COMPLETED',
					date: { lt: sixMonthsAgo },
				},
				_sum: { amount: true },
			}),
		])

		runningBalance -= Number(priorTransfersFrom._sum.amount ?? 0)
		runningBalance += Number(priorTransfersTo._sum.amount ?? 0)

		// Build result with running balance
		const data = Array.from(monthlyChanges.entries()).map(([key, change]) => {
			runningBalance += change
			const [year, month] = key.split('-').map(Number)
			return {
				month: month + 1,
				year,
				balance: Math.round(runningBalance * 100) / 100,
			}
		})

		return { data }
	}

	async getRecentMovements(accountId: string, userId: string, limit = 5) {
		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: { id: accountId, userId },
		})

		if (!bankAccount) throw new NotFoundException('Bank account not found')

		const [transactions, transfers] = await Promise.all([
			this.prisma.transaction.findMany({
				where: { bankAccountId: accountId },
				orderBy: { date: 'desc' },
				take: limit,
				include: {
					category: { select: { title: true, type: true } },
				},
			}),
			this.prisma.transfer.findMany({
				where: {
					OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
					status: 'COMPLETED',
				},
				orderBy: { date: 'desc' },
				take: limit,
				include: {
					fromAccount: {
						select: { id: true, name: true },
					},
					toAccount: {
						select: { id: true, name: true },
					},
				},
			}),
		])

		const movements = [
			...transactions.map((tx) => ({
				id: tx.id,
				type: 'transaction' as const,
				amount: Number(tx.amount),
				date: tx.date,
				description: tx.title,
				transactionType: tx.type,
				category: tx.category,
			})),
			...transfers.map((t) => ({
				id: t.id,
				type: 'transfer' as const,
				amount: Number(t.amount),
				date: t.date,
				description: t.description || 'Transfer',
				fromAccount: t.fromAccount,
				toAccount: t.toAccount,
			})),
		]

		movements.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		)

		return { data: movements.slice(0, limit) }
	}
}
