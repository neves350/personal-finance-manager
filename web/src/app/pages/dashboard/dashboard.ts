import { Component } from '@angular/core'
import { DashboardCard } from '@/shared/components/dashboard/dashboard-card/dashboard-card'
import { DashboardCards } from '@/shared/components/dashboard/dashboard-cards/dashboard-cards'
import { DashboardChart } from '@/shared/components/dashboard/dashboard-chart/dashboard-chart'
import { DashboardHeader } from '@/shared/components/dashboard/dashboard-header/dashboard-header'
import { DashboardTransactions } from '@/shared/components/dashboard/dashboard-transactions/dashboard-transactions'

@Component({
	selector: 'app-dashboard',
	imports: [
		DashboardCard,
		DashboardChart,
		DashboardCards,
		DashboardTransactions,
		DashboardHeader,
	],
	templateUrl: './dashboard.html',
})
export class Dashboard {}
