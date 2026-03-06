import { Component, inject } from '@angular/core'
import { DashboardCard } from '@/shared/components/dashboard/dashboard-card/dashboard-card'
import { DashboardCards } from '@/shared/components/dashboard/dashboard-cards/dashboard-cards'
import { DashboardCashflow } from '@/shared/components/dashboard/dashboard-cashflow/dashboard-cashflow'
import { DashboardChart } from '@/shared/components/dashboard/dashboard-chart/dashboard-chart'
import { DashboardHeader } from '@/shared/components/dashboard/dashboard-header/dashboard-header'
import { DashboardTransactions } from '@/shared/components/dashboard/dashboard-transactions/dashboard-transactions'
import {
	PeriodType,
	type StatisticsQueryParams,
} from '@core/api/statistics.interface'
import { StatisticsService } from '@core/services/statistics.service'

@Component({
	selector: 'app-dashboard',
	imports: [
		DashboardCard,
		DashboardChart,
		DashboardCards,
		DashboardTransactions,
		DashboardHeader,
		DashboardCashflow,
	],
	templateUrl: './dashboard.html',
})
export class Dashboard {
	private readonly statisticsService = inject(StatisticsService)

	constructor() {
		this.statisticsService.loadStatistics({ period: PeriodType.MONTH })
	}

	onFilterChange(params: StatisticsQueryParams): void {
		this.statisticsService.loadStatistics(params)
	}
}
