import { CurrencyPipe } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	LucideAngularModule,
	TrendingDownIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-expense-card',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './expense-card.html',
})
export class ExpenseCard {
	readonly expense = input<number>(0)
	readonly percentageChange = input<number>(0)
	readonly periodLabel = input<string>('last month')
	readonly title = input<string>('MONTHLY EXPENSES')

	readonly TrendingDownIcon = TrendingDownIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon

	readonly isPositiveChange = computed(() => this.percentageChange() <= 0)

	readonly formattedExpense = computed(() => this.expense())

	readonly formattedPercentage = computed(() => {
		const value = Math.abs(this.percentageChange())
		const sign = this.percentageChange() >= 0 ? '+' : '-'
		return `${sign}${value.toFixed(1)}%`
	})
}
