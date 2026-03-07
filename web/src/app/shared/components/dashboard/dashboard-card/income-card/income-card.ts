import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	LucideAngularModule,
	TrendingUpIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-income-card',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './income-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomeCard {
	readonly income = input<number>(0)
	readonly percentageChange = input<number>(0)
	readonly periodLabel = input<string>('last month')
	readonly title = input<string>('MONTHLY INCOME')

	readonly TrendingUpIcon = TrendingUpIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon

	readonly isPositiveChange = computed(() => this.percentageChange() >= 0)

	readonly formattedIncome = computed(() => this.income())

	readonly formattedPercentage = computed(() => {
		const value = Math.abs(this.percentageChange())
		const sign = this.percentageChange() >= 0 ? '+' : '-'
		return `${sign}${value.toFixed(1)}%`
	})
}
