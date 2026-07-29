import { Injectable } from '@nestjs/common'
import type { HeatmapDay } from '../interfaces/heatmap-day.interface'

@Injectable()
export class HeatmapService {
	generateHeatmap(
		deposits: any[],
		startDate: Date,
		endDate: Date | null,
	): HeatmapDay[] {
		const end = endDate ?? new Date() // fallback to today if no endDate

		const depositMap = new Map<string, number>()
		for (const deposit of deposits) {
			const dateKey = deposit.date.toISOString().split('T')[0]
			const amount = Number(deposit.amount)
			depositMap.set(dateKey, (depositMap.get(dateKey) || 0) + amount)
		}

		const days: HeatmapDay[] = []
		const currentDate = new Date(startDate)

		while (currentDate <= end) {
			const dateKey = currentDate.toISOString().split('T')[0]
			days.push({
				date: dateKey,
				amount: depositMap.get(dateKey) || 0,
				hasDeposit: depositMap.has(dateKey),
			})
			currentDate.setDate(currentDate.getDate() + 1)
		}

		return days
	}
}
