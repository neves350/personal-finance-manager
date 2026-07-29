import {
	afterNextRender,
	Component,
	computed,
	effect,
	inject,
	signal,
} from '@angular/core'
import { StatisticsService } from '@core/services/statistics.service'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChartColumnBigIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ChartComponent } from 'ng-apexcharts'
import { ZardCardComponent } from '../../ui/card'
import {
	createGroupedBarOptions,
	type GroupedBarChartOptions,
} from './statistics-period-chart.config'

@Component({
	selector: 'app-statistics-period',
	imports: [ZardCardComponent, LucideAngularModule, ChartComponent],
	templateUrl: './statistics-period.html',
})
export class StatisticsPeriod {
	private readonly statisticsService = inject(StatisticsService)

	readonly ChartColumnBigIcon = ChartColumnBigIcon
	readonly trends = this.statisticsService.trends
	readonly chartOptions = signal<Partial<GroupedBarChartOptions> | null>(null)

	readonly changes = computed(() => {
		const t = this.trends()
		if (!t) return null
		return [
			{
				label: 'Income',
				value: t.change.income,
				type: 'positive' as const,
				icon: this.changeIcon(t.change.income),
			},
			{
				label: 'Expenses',
				value: t.change.expenses,
				type: 'negative' as const,
				icon: this.changeIcon(t.change.expenses),
			},
			{
				label: 'Balance',
				value: t.change.balance,
				type: 'balance' as const,
				icon: this.changeIcon(t.change.balance),
			},
		]
	})

	constructor() {
		afterNextRender(() => {
			this.initChart()
			this.observeThemeChanges()
		})

		effect(() => {
			const t = this.trends()
			if (t) this.initChart()
		})
	}

	private changeIcon(value: string) {
		const isPositive = value.startsWith('+') && value !== '+0%'
		return isPositive ? ArrowUpIcon : ArrowDownIcon
	}

	private initChart(): void {
		const t = this.trends()
		if (!t) {
			this.chartOptions.set(null)
			return
		}
		this.chartOptions.set(createGroupedBarOptions(t))
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
