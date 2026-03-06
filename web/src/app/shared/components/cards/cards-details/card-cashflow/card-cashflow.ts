import {
	afterNextRender,
	Component,
	inject,
	input,
	signal,
} from '@angular/core'
import { Card } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import { ChartComponent } from 'ng-apexcharts'
import {
	type ChartOptions,
	MONTHS,
} from '@/shared/components/dashboard/dashboard-chart/transaction-chart/transaction-chart.config'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { createCashflowChartOptions } from './cashflow-chart.config'

@Component({
	selector: 'app-card-cashflow',
	imports: [ZardCardComponent, ChartComponent],
	templateUrl: './card-cashflow.html',
})
export class CardCashflow {
	readonly card = input.required<Card>()
	private readonly cardsService = inject(CardsService)

	readonly chartOptions = signal<Partial<ChartOptions> | null>(null)

	constructor() {
		afterNextRender(() => {
			this.fetchCashflow()
			this.observeThemeChanges()
		})
	}

	private fetchCashflow() {
		this.cardsService.cashflow(this.card().id!).subscribe((res) => {
			const months = res.data.map(
				(d) => `${MONTHS[d.month - 1]} ${d.year}`,
			)
			const incomeData = res.data.map((d) => d.income)
			const expensesData = res.data.map((d) => d.expense)

			this.chartOptions.set(
				createCashflowChartOptions(incomeData, expensesData, months),
			)
		})
	}

	private observeThemeChanges() {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === 'attributes' &&
					mutation.attributeName === 'class'
				) {
					this.fetchCashflow()
				}
			}
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})
	}
}
