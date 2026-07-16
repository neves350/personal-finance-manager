import { Component, inject } from '@angular/core'
import type { StatisticsQueryParams } from '@core/api/statistics.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { StatisticsService } from '@core/services/statistics.service'
import { ChartPieIcon, LucideAngularModule } from 'lucide-angular'
import { PageHeader } from '@/shared/components/page-header/page-header'
import { StatisticsBreakdown } from '@/shared/components/statistics/statistics-breakdown/statistics-breakdown'
import { StatisticsCategories } from '@/shared/components/statistics/statistics-categories/statistics-categories'
import { StatisticsFilter } from '@/shared/components/statistics/statistics-filter/statistics-filter'
import { StatisticsInsights } from '@/shared/components/statistics/statistics-insights/statistics-insights'
import { StatisticsPeriod } from '@/shared/components/statistics/statistics-period/statistics-period'
import { StatisticsSummary } from '@/shared/components/statistics/statistics-summary/statistics-summary'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'

@Component({
	selector: 'app-statistics',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		StatisticsFilter,
		StatisticsSummary,
		StatisticsCategories,
		StatisticsPeriod,
		StatisticsBreakdown,
		StatisticsInsights,
		ZardLoaderComponent,
		PageHeader,
	],
	templateUrl: './statistics.html',
})
export class Statistics {
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly statisticsService = inject(StatisticsService)
	private readonly categoriesService = inject(CategoriesService)

	readonly categories = this.categoriesService.categories
	readonly accounts = this.bankAccountsService.bankAccounts
	readonly hasData = this.statisticsService.hasData
	readonly isLoading = this.statisticsService.loading
	readonly ChartPieIcon = ChartPieIcon

	constructor() {
		this.bankAccountsService.loadBankAccounts().subscribe()
		this.statisticsService.loadStatistics({
			period: this.statisticsService.period(),
		})
		this.categoriesService.loadCategories().subscribe()
	}

	onFilterChange(params: StatisticsQueryParams) {
		this.statisticsService.loadStatistics(params)
	}
}
