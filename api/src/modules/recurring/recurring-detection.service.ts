import { Injectable, Logger } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { PrismaService } from 'src/infrastructure/db/prisma.service'

type Frequency = 'MONTH' | 'ANNUAL'

interface TransactionGroup {
	normalizedDesc: string
	type: 'INCOME' | 'EXPENSE'
	bankAccountId: string
	categoryId: string
	amounts: number[]
	dates: Date[]
}

@Injectable()
export class RecurringDetectionService {
	private readonly logger = new Logger(RecurringDetectionService.name)

	constructor(private readonly prisma: PrismaService) {}

	async detectRecurringPatterns(userId: string): Promise<void> {
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		const transactions = await this.prisma.transaction.findMany({
			where: {
				bankAccount: { userId },
				source: 'OPEN_BANKING',
				date: { gte: sixMonthsAgo },
			},
			orderBy: { date: 'asc' },
			select: {
				id: true,
				title: true,
				type: true,
				amount: true,
				date: true,
				bankAccountId: true,
				categoryId: true,
				recurringId: true,
			},
		})

		// Group by (normalizedDesc, type, bankAccountId)
		const groups = new Map<string, TransactionGroup>()

		for (const tx of transactions) {
			if (tx.recurringId) continue // already linked

			const normalizedDesc = this.normalizeDescription(tx.title)
			const key = `${normalizedDesc}|${tx.type}|${tx.bankAccountId}`

			if (!groups.has(key)) {
				groups.set(key, {
					normalizedDesc,
					type: tx.type as 'INCOME' | 'EXPENSE',
					bankAccountId: tx.bankAccountId,
					categoryId: tx.categoryId,
					amounts: [],
					dates: [],
				})
			}

			const group = groups.get(key)!
			group.amounts.push(Number(tx.amount))
			group.dates.push(tx.date)
		}

		let detected = 0

		for (const group of groups.values()) {
			if (group.dates.length < 2) continue

			const frequency = this.detectFrequency(group.dates)
			if (!frequency) continue

			if (!this.amountsAreSimilar(group.amounts)) continue

			const avgAmount = this.average(group.amounts)
			const avgDayOfMonth = this.averageDayOfMonth(group.dates)

			const patternHash = this.buildPatternHash(
				group.normalizedDesc,
				group.type,
				frequency,
				avgDayOfMonth,
			)

			// Skip if already exists
			const existing = await this.prisma.recurring.findUnique({
				where: { patternHash },
			})
			if (existing) continue

			// Find a default category as fallback
			const category = await this.prisma.category.findFirst({
				where: {
					id: group.categoryId,
					OR: [{ userId }, { isDefault: true }],
				},
			})
			if (!category) continue

			await this.prisma.recurring.create({
				data: {
					bankAccountId: group.bankAccountId,
					categoryId: category.id,
					description: group.normalizedDesc,
					type: group.type,
					amount: avgAmount,
					monthDay: avgDayOfMonth,
					frequency,
					autoDetected: true,
					patternHash,
				},
			})

			detected++
			this.logger.log(
				`Detected recurring: "${group.normalizedDesc}" (${group.type}, ${frequency}, day ${avgDayOfMonth}, ~${avgAmount.toFixed(2)})`,
			)
		}

		if (detected > 0) {
			this.logger.log(`Detected ${detected} new recurring patterns for user ${userId}`)
		}
	}

	private normalizeDescription(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	}

	private detectFrequency(dates: Date[]): Frequency | null {
		if (dates.length < 2) return null

		const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
		const intervals: number[] = []

		for (let i = 1; i < sorted.length; i++) {
			const days =
				(sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24)
			intervals.push(days)
		}

		const avgInterval = this.average(intervals)

		if (avgInterval >= 25 && avgInterval <= 35) return 'MONTH'
		if (avgInterval >= 350 && avgInterval <= 380) return 'ANNUAL'

		return null
	}

	private amountsAreSimilar(amounts: number[]): boolean {
		const avg = this.average(amounts)
		const margin = avg * 0.05
		return amounts.every((a) => Math.abs(a - avg) <= margin)
	}

	private average(values: number[]): number {
		return values.reduce((sum, v) => sum + v, 0) / values.length
	}

	private averageDayOfMonth(dates: Date[]): number {
		const avg = this.average(dates.map((d) => d.getDate()))
		return Math.round(avg)
	}

	private buildPatternHash(
		normalizedDesc: string,
		type: string,
		frequency: Frequency,
		dayOfMonth: number,
	): string {
		return createHash('sha256')
			.update(`${normalizedDesc}|${type}|${frequency}|${dayOfMonth}`)
			.digest('hex')
			.slice(0, 32)
	}
}
