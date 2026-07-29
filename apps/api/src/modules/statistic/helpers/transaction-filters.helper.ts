import { Injectable } from '@nestjs/common'
import { PeriodType, QueryStatisticsDto } from '../dtos/query-statistics.dto'

@Injectable()
export class TransactionFiltersService {
	/**
	 * @param userId
	 * @param query
	 * @returns Objeto WHERE para usar no Prisma
	 */
	buildFilters(userId: string, query: QueryStatisticsDto) {
		const filters: any = {
			bankAccount: {
				userId,
			},
		}

		if (query.bankAccountId) {
			filters.bankAccountId = query.bankAccountId
		}

		if (query.startDate || query.endDate) {
			filters.date = {} // manual dates

			if (query.startDate) {
				filters.date.gte = new Date(query.startDate)
			}

			if (query.endDate) {
				filters.date.lte = new Date(`${query.endDate}T23:59:59.999Z`)
			}
		} else if (query.period) {
			const dates = this.getPeriodDates(query.period)
			filters.date = {
				gte: dates.start,
				lte: dates.end,
			}
		}

		return filters
	}

	private getPeriodDates(period: PeriodType): {
		start: Date
		end: Date
	} {
		const now = new Date()
		const start = new Date()

		if (period === PeriodType.WEEK) {
			start.setDate(now.getDate() - 7) // last 7 days
		} else if (period === PeriodType.MONTH) {
			start.setDate(now.getDate() - 30) // last month
		} else if (period === PeriodType.YEAR) {
			start.setDate(now.getDate() - 365) // last year
		}

		return {
			start,
			end: now,
		}
	}
}
