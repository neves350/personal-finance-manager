import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
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
	private readonly elementRef = inject(ElementRef)

	readonly chartOptions = signal<Partial<CashflowChartOptions> | null>(null)

	private resizeTimer: ReturnType<typeof setTimeout> | null = null

	constructor() {
		afterNextRender(() => {
			const mutationObserver = new MutationObserver(() => this.rebuildChart())
			mutationObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class'],
			})

			const resizeObserver = new ResizeObserver(() => {
				if (this.resizeTimer) clearTimeout(this.resizeTimer)
				this.resizeTimer = setTimeout(() => this.rebuildChart(), 150)
			})
			resizeObserver.observe(this.elementRef.nativeElement)
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
