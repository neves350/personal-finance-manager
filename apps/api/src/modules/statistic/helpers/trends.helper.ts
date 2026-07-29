import { Injectable } from '@nestjs/common'

@Injectable()
export class TrendsService {
	calculatePreviousPeriod(currentFilters: any): any {
		if (!currentFilters.date) {
			return currentFilters
		}

		const start = new Date(currentFilters.date.gte)
		const end = new Date(currentFilters.date.lte || currentFilters.date.lt)

		// calculate period days
		const diffTime = end.getTime() - start.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		const previousEnd = new Date(start)
		previousEnd.setDate(previousEnd.getDate() - 1)

		const previousStart = new Date(previousEnd)
		previousStart.setDate(previousStart.getDate() - diffDays + 1)

		return {
			...currentFilters,
			date: {
				gte: previousStart,
				lte: previousEnd,
			},
		}
	}

	calculatePercentageChange(oldValue: number, newValue: number): string {
		if (oldValue === 0) {
			return newValue > 0 ? '+100%' : '0%'
		}

		// Calculate percentage
		const change = ((newValue - oldValue) / oldValue) * 100
		const rounded = Math.round(change * 100) / 100 // 2 decimal

		return rounded >= 0 ? `+${rounded}%` : `${rounded}%`
	}

	getPeriodLabel(filters: any): string {
		if (!filters.date) {
			return 'All time'
		}

		const start = new Date(filters.date.gte)
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		]
		const month = monthNames[start.getMonth()]
		const year = start.getFullYear()

		return `${month} ${year}`
	}
}
