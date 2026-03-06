import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	signal,
} from '@angular/core'
import { StatisticsService } from '@core/services/statistics.service'
import { ChartComponent } from 'ng-apexcharts'
import { ZardCardComponent } from '../../ui/card'
import {
	type CashflowChartOptions,
	createCashflowOptions,
} from './dashboard-cashflow.config'

@Component({
	selector: 'app-dashboard-cashflow',
	imports: [ZardCardComponent, ChartComponent],
	templateUrl: './dashboard-cashflow.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCashflow {
	private readonly statisticsService = inject(StatisticsService)

	readonly chartOptions = signal<Partial<CashflowChartOptions> | null>(null)

	constructor() {
		afterNextRender(() => {
			const observer = new MutationObserver(() => this.rebuildChart())
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			})
		})

		effect(() => {
			const dailyTotals = this.statisticsService.dailyTotals()
			if (dailyTotals) {
				this.rebuildChart()
			}
		})
	}

	private rebuildChart(): void {
		const data = this.statisticsService.dailyTotals()
		const dailyTotals = Array.isArray(data) ? data[0] : data
		if (!dailyTotals) return

		const labels = dailyTotals.labels ?? []
		const income = dailyTotals.income ?? []
		const expenses = dailyTotals.expenses ?? []
		const period = this.statisticsService.period()

		this.chartOptions.set(
			createCashflowOptions(labels, income, expenses, period),
		)
	}
}
