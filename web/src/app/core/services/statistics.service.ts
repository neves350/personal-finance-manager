import { computed, Injectable, inject, signal } from '@angular/core'
import { StatisticsApi } from '@core/api/statistics.api'
import {
	PeriodType,
	type StatisticsByCategory,
	type StatisticsDailyTotals,
	type StatisticsOverview,
	type StatisticsQueryParams,
	type StatisticsTrends,
} from '@core/api/statistics.interface'
import { forkJoin, Subject, switchMap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class StatisticsService {
	private readonly statisticsApi = inject(StatisticsApi)
	private readonly loadTrigger$ = new Subject<StatisticsQueryParams | undefined>()

	readonly period = signal<PeriodType>(PeriodType.MONTH)
	readonly overview = signal<StatisticsOverview | null>(null)
	readonly trends = signal<StatisticsTrends | null>(null)
	readonly expenseByCategory = signal<StatisticsByCategory | null>(null)
	readonly incomeByCategory = signal<StatisticsByCategory | null>(null)
	readonly dailyTotals = signal<StatisticsDailyTotals[] | null>(null)
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)

	readonly periodLabel = computed(() => {
		const labels: Record<PeriodType, string> = {
			[PeriodType.WEEK]: 'last week',
			[PeriodType.MONTH]: 'last month',
			[PeriodType.YEAR]: 'last year',
		}
		return labels[this.period()]
	})

	readonly hasData = computed(() => {
		const overview = this.overview()
		return overview !== null && overview.transactionCount > 0
	})

	readonly expenseCategories = computed(() => {
		return this.expenseByCategory()?.categories ?? []
	})

	readonly incomeCategories = computed(() => {
		return this.incomeByCategory()?.categories ?? []
	})

	constructor() {
		this.loadTrigger$
			.pipe(
				switchMap((params) => {
					this.loading.set(true)
					this.error.set(null)
					if (params?.period) this.period.set(params.period)

					return forkJoin([
						this.statisticsApi.getOverview(params),
						this.statisticsApi.getTrends(params),
						this.statisticsApi.getByCategory({
							...params,
							type: 'EXPENSE',
						}),
						this.statisticsApi.getByCategory({
							...params,
							type: 'INCOME',
						}),
						this.statisticsApi.getDailyTotals(params),
					])
				}),
			)
			.subscribe({
				next: ([
					overview,
					trends,
					expenseByCategory,
					incomeByCategory,
					dailyTotals,
				]) => {
					this.overview.set(overview)
					this.trends.set(trends)
					this.expenseByCategory.set(expenseByCategory)
					this.incomeByCategory.set(incomeByCategory)
					this.dailyTotals.set(dailyTotals)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load statistics')
					this.loading.set(false)
				},
			})
	}

	loadStatistics(params?: StatisticsQueryParams): void {
		this.loadTrigger$.next(params)
	}
}
