import { Injectable } from '@nestjs/common'

@Injectable()
export class SpendingLimitService {
	calculateSpendingBreakdown(remainingLimit: number, endDate: Date | null) {
		if (!endDate || remainingLimit <= 0) return null

		const now = new Date()
		const daysLeft = Math.ceil(
			(endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		)

		if (daysLeft <= 0) {
			return {
				daily: 0,
				weekly: 0,
				monthly: 0,
				daysRemaining: 0,
			}
		}

		const weeksLeft = Math.ceil(daysLeft / 7)
		const monthsLeft = Math.ceil(daysLeft / 30)

		return {
			daily: Number((remainingLimit / daysLeft).toFixed(2)),
			weekly: Number((remainingLimit / weeksLeft).toFixed(2)),
			monthly: Number((remainingLimit / monthsLeft).toFixed(2)),
			daysRemaining: daysLeft,
		}
	}

	calculatePaceStatus(
		spent: number,
		limit: number,
		startDate: Date,
		endDate: Date | null,
	): 'ON_TRACK' | 'OVER_PACE' | 'COMPLETED' {
		if (spent >= limit) return 'COMPLETED'
		if (!endDate) return spent < limit ? 'ON_TRACK' : 'OVER_PACE'

		const now = new Date()
		const totalDuration = endDate.getTime() - startDate.getTime()
		const elapsed = now.getTime() - startDate.getTime()
		const progressRatio = elapsed / totalDuration
		const expectedSpending = limit * progressRatio

		return spent <= expectedSpending ? 'ON_TRACK' : 'OVER_PACE'
	}
}
