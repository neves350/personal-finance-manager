import { Component, computed, input } from '@angular/core'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	LucideAngularModule,
	PercentIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-savings-rate-card',
	imports: [ZardCardComponent, LucideAngularModule],
	templateUrl: './savings-rate-card.html',
})
export class SavingsRateCard {
	readonly savingsRate = input<number>(0)
	readonly percentageChange = input<number>(0)
	readonly periodLabel = input<string>('last month')
	readonly title = input<string>('SAVINGS RATE')

	readonly PercentIcon = PercentIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon

	readonly isPositiveChange = computed(() => this.percentageChange() >= 0)

	readonly formattedRate = computed(() => {
		return `${this.savingsRate().toFixed(0)}%`
	})

	readonly formattedPercentage = computed(() => {
		const value = Math.abs(this.percentageChange())
		const sign = this.percentageChange() >= 0 ? '+' : '-'
		return `${sign}${value.toFixed(1)}%`
	})
}
