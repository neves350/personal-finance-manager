import { CurrencyPipe } from '@angular/common'
import { Component, computed, input } from '@angular/core'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	HandCoinsIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-balance-card',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './balance-card.html',
})
export class BalanceCard {
	readonly balance = input<number>(0)
	readonly percentageChange = input<number>(0)
	readonly periodLabel = input<string>('last month')
	readonly title = input<string>('TOTAL BALANCE')

	readonly HandCoinsIcon = HandCoinsIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon

	readonly isPositiveChange = computed(() => this.percentageChange() >= 0)

	readonly formattedBalance = computed(() => this.balance())

	readonly formattedPercentage = computed(() => {
		const value = Math.abs(this.percentageChange())
		const sign = this.percentageChange() >= 0 ? '+' : '-'
		return `${sign}${value.toFixed(1)}%`
	})
}
