import { CurrencyPipe } from '@angular/common'
import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
} from '@angular/core'
import { type Card, CardType } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardProgressBarComponent } from '@/shared/components/ui/progress-bar'

@Component({
	selector: 'app-card-summary',
	imports: [
		ZardCardComponent,
		ZardProgressBarComponent,
		ZardDividerComponent,
		CurrencyPipe,
	],
	templateUrl: './card-summary.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'h-full' },
})
export class CardSummary {
	readonly card = input.required<Card>()
	private readonly cardsService = inject(CardsService)

	readonly isCreditCard = computed(
		() => this.card().type === CardType.CREDIT_CARD,
	)
	readonly currentMonthExpenses = signal<number>(0)

	readonly limitUsagePercent = computed(() => {
		const limit = Number(this.card().creditLimit)
		if (!limit) return 0
		return Math.min((this.currentMonthExpenses() / limit) * 100, 100)
	})

	readonly limitUsagePercentRounded = computed(() =>
		Math.round(this.limitUsagePercent()),
	)

	readonly formattedExpenses = computed(() =>
		this.currentMonthExpenses().toLocaleString('pt-PT', {
			minimumFractionDigits: 2,
		}),
	)

	readonly formattedLimit = computed(() =>
		Number(this.card().creditLimit).toLocaleString('pt-PT', {
			minimumFractionDigits: 2,
		}),
	)

	readonly maskedCardNumber = computed(() => {
		const last = this.card().lastFour
		return last ? `•••• •••• •••• ${last}` : '•••• •••• •••• ••••'
	})

	constructor() {
		afterNextRender(() => {
			if (this.isCreditCard()) this.fetchMonthlyExpenses()
		})
	}

	private fetchMonthlyExpenses() {
		const now = new Date()
		const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
			.toISOString()
			.split('T')[0]
		const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
			.toISOString()
			.split('T')[0]

		this.cardsService
			.monthlyExpenses(this.card().id!, { startDate, endDate })
			.subscribe((res) => {
				this.currentMonthExpenses.set(Number(res._sum.amount ?? 0))
			})
	}
}
