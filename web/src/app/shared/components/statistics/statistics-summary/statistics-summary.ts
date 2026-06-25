import { CurrencyPipe } from '@angular/common'
import {
	afterNextRender,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { StatisticsService } from '@core/services/statistics.service'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CoinsIcon,
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
} from 'lucide-angular'
import { NgApexchartsModule } from 'ng-apexcharts'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardCardComponent } from '../../ui/card'
import { createSparklineChartOptions } from './statistics-summary-sparkline.config'

@Component({
	selector: 'app-statistics-summary',
	imports: [
		LucideAngularModule,
		ZardCardComponent,
		CurrencyPipe,
		ZardBadgeComponent,
		NgApexchartsModule,
	],
	templateUrl: './statistics-summary.html',
})
export class StatisticsSummary {
	private readonly statisticsService = inject(StatisticsService)
	private readonly rendered = signal(false)
	private readonly themeVersion = signal(0)

	readonly totalIncome = computed(
		() => this.statisticsService.overview()?.totalIncome ?? 0,
	)
	readonly totalExpenses = computed(
		() => this.statisticsService.overview()?.totalExpenses ?? 0,
	)
	readonly totalBalance = computed(
		() => this.statisticsService.overview()?.balance ?? 0,
	)

	readonly incomeChange = this.parseChange('income')
	readonly expensesChange = this.parseChange('expenses')
	readonly balanceChange = this.parseChange('balance')

	readonly periodLabel = this.statisticsService.periodLabel

	readonly incomeSparkline = this.createSparkline(
		'income',
		'--primary',
		'Income',
	)
	readonly expenseSparkline = this.createSparkline(
		'expenses',
		'--destructive',
		'Expenses',
	)
	readonly balanceSparkline = this.createSparkline(
		'balance',
		'--chart-2',
		'Balance',
	)

	readonly TrendingUpIcon = TrendingUpIcon
	readonly TrendingDownIcon = TrendingDownIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon
	readonly CoinsIcon = CoinsIcon

	constructor() {
		afterNextRender(() => {
			this.rendered.set(true)
			this.observeThemeChanges()
		})
	}

	private parseChange(key: 'income' | 'expenses' | 'balance') {
		return computed(() => {
			const change = this.statisticsService.trends()?.change[key]
			return change ? Number.parseFloat(change) : 0
		})
	}

	private createSparkline(
		key: 'income' | 'expenses' | 'balance',
		cssVar: string,
		name: string,
	) {
		return computed(() => {
			if (!this.rendered()) return null
			this.themeVersion()

			const data = this.statisticsService.dailyTotals()
			const totals = Array.isArray(data) ? data[0] : data
			if (!totals) return null

			return createSparklineChartOptions(
				totals[key],
				cssVar,
				totals.labels,
				name,
			)
		})
	}

	private observeThemeChanges(): void {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === 'attributes' &&
					mutation.attributeName === 'class'
				) {
					this.themeVersion.update((v) => v + 1)
				}
			}
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		})
	}
}
