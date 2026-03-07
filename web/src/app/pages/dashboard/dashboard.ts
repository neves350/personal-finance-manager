import { Component, inject } from '@angular/core'
import {
	PeriodType,
	type StatisticsQueryParams,
} from '@core/api/statistics.interface'
import { StatisticsService } from '@core/services/statistics.service'
import { DashboardCashflow } from '@/shared/components/dashboard/dashboard-cashflow/dashboard-cashflow'
import { DashboardGoals } from '@/shared/components/dashboard/dashboard-goals/dashboard-goals'
import { DashboardHeader } from '@/shared/components/dashboard/dashboard-header/dashboard-header'
import { DashboardSpending } from '@/shared/components/dashboard/dashboard-spending/dashboard-spending'
import { DashboardTransactions } from '@/shared/components/dashboard/dashboard-transactions/dashboard-transactions'

@Component({
	selector: 'app-dashboard',
	imports: [
		DashboardHeader,
		DashboardCashflow,
		DashboardSpending,
		DashboardGoals,
		DashboardTransactions,
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
