import {
	afterNextRender,
	Component,
	computed,
	inject,
	input,
	signal,
	viewChild,
} from '@angular/core'
import { BankAccountsApi } from '@core/api/bank-accounts.api'
import type {
	BalanceHistoryItem,
	BankAccount,
} from '@core/api/bank-accounts.interface'
import {
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
} from 'lucide-angular'
import { ChartComponent } from 'ng-apexcharts'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import {
	type BalanceChartOptions,
	createBalanceChartOptions,
	MONTHS_PT,
} from './account-balance-chart.config'

@Component({
	selector: 'app-account-balance-chart',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardDividerComponent,
		ChartComponent,
	],
	templateUrl: './account-balance-chart.html',
})
export class AccountBalanceChart {
	readonly account = input.required<BankAccount>()
	readonly chart = viewChild<ChartComponent>('chart')
	readonly chartOptions = signal<Partial<BalanceChartOptions> | null>(null)
	readonly balanceHistory = signal<BalanceHistoryItem[]>([])

	private readonly bankAccountsApi = inject(BankAccountsApi)

	readonly percentageChange = computed(() => {
		const data = this.balanceHistory()
		if (data.length < 2) return 0

		const first = data[0].balance
		const last = data[data.length - 1].balance

		if (first === 0) return last > 0 ? 100 : 0

		return Math.round(((last - first) / Math.abs(first)) * 1000) / 10
	})

	readonly isPositiveChange = computed(() => this.percentageChange() >= 0)

	readonly trendIcon = computed(() =>
		this.isPositiveChange() ? TrendingUpIcon : TrendingDownIcon,
	)

	readonly formattedChange = computed(() => {
		const value = this.percentageChange()
		return `${value >= 0 ? '+' : ''}${value}%`
	})

	readonly firstMonthLabel = computed(() => {
		const data = this.balanceHistory()
		if (data.length === 0) return ''
		return `${MONTHS_PT[data[0].month - 1]}. ${data[0].year}`
	})

	readonly firstMonthBalance = computed(() => {
		const data = this.balanceHistory()
		if (data.length === 0) return ''
		return this.formatBalance(data[0].balance)
	})

	readonly lastMonthLabel = computed(() => {
		const data = this.balanceHistory()
		if (data.length === 0) return ''
		return `${MONTHS_PT[data[data.length - 1].month - 1]}. ${[data[data.length - 1].year]}`
	})

	readonly lastMonthBalance = computed(() => {
		const data = this.balanceHistory()
		if (data.length === 0) return ''
		return this.formatBalance(data[data.length - 1].balance)
	})

	constructor() {
		afterNextRender(() => {
			this.fetchBalanceHistory()
			this.observeThemeChanges()
		})
	}

	private fetchBalanceHistory(): void {
		const accountId = this.account().id
		if (!accountId) return

		this.bankAccountsApi.getBalanceHistory(accountId).subscribe((res) => {
			this.balanceHistory.set(res.data)
			this.initChart()
		})
	}

	private initChart(): void {
		const data = this.balanceHistory()
		if (data.length === 0) return

		const balances = data.map((item) => item.balance)
		const months = data.map(
			(item) => `${MONTHS_PT[item.month - 1]} ${item.year}`,
		)
		const lastBalance = balances[balances.length - 1]

		this.chartOptions.set(
			createBalanceChartOptions(balances, months, lastBalance < 0),
		)
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

	formatBalance(value: number): string {
		return `€${value.toLocaleString()}`
	}
}
