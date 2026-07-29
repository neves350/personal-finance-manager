import { Injectable } from '@nestjs/common'

@Injectable()
export class SavingsService {
	calculateSavingsBreakdown(remainingAmount: number, endDate: Date | null) {
		if (!endDate || remainingAmount <= 0) return null

		const now = new Date()
		const daysLeft = Math.ceil(
			(endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
		)

		if (daysLeft <= 0) {
			return { daily: 0, weekly: 0, monthly: 0, daysRemaining: 0 }
		}

		const weeksLeft = Math.ceil(daysLeft / 7)
		const monthsLeft = Math.ceil(daysLeft / 30)

		return {
			daily: Number((remainingAmount / daysLeft).toFixed(2)),
			weekly: Number((remainingAmount / weeksLeft).toFixed(2)),
			monthly: Number((remainingAmount / monthsLeft).toFixed(2)),
			daysRemaining: daysLeft,
		}
	}

	calculatePaceStatus(
		saved: number,
		target: number,
		startDate: Date,
		endDate: Date | null,
	): 'ON_TRACK' | 'OFF_PACE' | 'COMPLETED' {
		if (saved >= target) return 'COMPLETED'
		if (!endDate) return 'ON_TRACK'

		const now = new Date()
		const totalDuration = endDate.getTime() - startDate.getTime()
		const elapsed = now.getTime() - startDate.getTime()
		const progressRatio = elapsed / totalDuration
		const expectedSavings = target * progressRatio

		return saved >= expectedSavings ? 'ON_TRACK' : 'OFF_PACE'
	}
}
