import { CurrencyPipe } from '@angular/common'
import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	signal,
} from '@angular/core'
import { PeriodType } from '@core/api/statistics.interface'
import { StatisticsService } from '@core/services/statistics.service'
import { ChartComponent } from 'ng-apexcharts'
import { ZardCardComponent } from '../../ui/card'
import {
	createDonutOptions,
	type DonutChartOptions,
} from './dashboard-spending.config'

const CATEGORY_COLORS = [
	'var(--chart-1)',
	'var(--chart-2)',
	'var(--chart-3)',
	'var(--chart-4)',
	'var(--chart-5)',
	'#f97316',
	'#ec4899',
	'#14b8a6',
	'#8b5cf6',
	'#f43f5e',
]

@Component({
	selector: 'app-dashboard-spending',
	imports: [ZardCardComponent, ChartComponent, CurrencyPipe],
	templateUrl: './dashboard-spending.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSpending {
	private readonly statisticsService = inject(StatisticsService)

	readonly categories = this.statisticsService.expenseCategories

	readonly periodLabel = computed(() => {
		const labels: Record<PeriodType, string> = {
			[PeriodType.WEEK]: 'week',
			[PeriodType.MONTH]: 'month',
			[PeriodType.YEAR]: 'year',
		}
		return labels[this.statisticsService.period()]
	})
	readonly hasCategories = computed(() => this.categories().length > 0)
	readonly chartOptions = signal<Partial<DonutChartOptions> | null>(null)

	constructor() {
		afterNextRender(() => {
			this.initChart()
			this.observeThemeChanges()
		})

		effect(() => {
			const cats = this.categories()
			if (cats) this.initChart()
		})
	}

	getCategoryColor(index: number): string {
		return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
	}

	private initChart(): void {
		const cats = this.categories()
		if (!cats || cats.length === 0) {
			this.chartOptions.set(null)
			return
		}

		const labels = cats.map((c) => c.categoryTitle)
		const amounts = cats.map((c) => c.total)
		this.chartOptions.set(createDonutOptions(labels, amounts))
	}

	private observeThemeChanges(): void {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === 'attributes' &&
					mutation.attributeName === 'class'
				) {
					this.initChart()
				}
			}
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})
	}
}
