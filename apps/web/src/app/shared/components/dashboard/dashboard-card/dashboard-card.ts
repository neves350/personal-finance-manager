import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { PeriodType } from '@core/api/statistics.interface'
import { StatisticsService } from '@core/services/statistics.service'
import { BalanceCard } from './balance-card/balance-card'
import { ExpenseCard } from './expense-card/expense-card'
import { IncomeCard } from './income-card/income-card'
import { SavingsRateCard } from './savings-rate-card/savings-rate-card'

const PERIOD_TITLES: Record<PeriodType, { income: string; expense: string }> = {
	[PeriodType.WEEK]: { income: 'WEEKLY INCOME', expense: 'WEEKLY EXPENSES' },
	[PeriodType.MONTH]: { income: 'MONTHLY INCOME', expense: 'MONTHLY EXPENSES' },
	[PeriodType.YEAR]: { income: 'YEARLY INCOME', expense: 'YEARLY EXPENSES' },
}

@Component({
	selector: 'app-dashboard-card',
	imports: [BalanceCard, IncomeCard, ExpenseCard, SavingsRateCard],
	templateUrl: './dashboard-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCard {
	private readonly statisticsService = inject(StatisticsService)

	readonly periodLabel = this.statisticsService.periodLabel

	readonly incomeTitle = computed(
		() => PERIOD_TITLES[this.statisticsService.period()].income,
	)
	readonly expenseTitle = computed(
		() => PERIOD_TITLES[this.statisticsService.period()].expense,
	)

	readonly balanceData = computed(() => ({
		balance: this.statisticsService.overview()?.balance ?? 0,
		percentageChange:
			this.statisticsService.overview()?.comparisonWithPreviousPeriod
				?.balanceChange ?? 0,
	}))

	readonly incomeData = computed(() => ({
		income: this.statisticsService.overview()?.totalIncome ?? 0,
		percentageChange:
			this.statisticsService.overview()?.comparisonWithPreviousPeriod
				?.incomeChange ?? 0,
	}))

	readonly expenseData = computed(() => ({
		expense: this.statisticsService.overview()?.totalExpenses ?? 0,
		percentageChange:
			this.statisticsService.overview()?.comparisonWithPreviousPeriod
				?.expensesChange ?? 0,
	}))

	readonly savingsData = computed(() => {
		const overview = this.statisticsService.overview()
		const trends = this.statisticsService.trends()

		const income = overview?.totalIncome ?? 0
		const expenses = overview?.totalExpenses ?? 0
		const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

		// Compute change from trends (percentage points difference)
		let percentageChange = 0
		if (trends) {
			const prevIncome = trends.previous.income
			const prevExpenses = trends.previous.expenses
			const prevRate =
				prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome) * 100 : 0
			percentageChange = savingsRate - prevRate
		}

		return { savingsRate, percentageChange }
	})
}
