import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core'
import { type Card, CardColor, CardType } from '@core/api/cards.interface'
import { CreditCardIcon, LucideAngularModule, WalletIcon } from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-cards-preview',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './cards-preview.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsPreview {
	readonly card = input.required<Partial<Card>>()

	protected readonly WalletIcon = WalletIcon
	protected readonly CreditCardIcon = CreditCardIcon

	private readonly colorClasses: Record<CardColor, string> = {
		[CardColor.GRAY]: 'text-zinc-500 bg-zinc-500/20',
		[CardColor.PURPLE]: 'text-chart-3 bg-chart-3/20',
		[CardColor.BLUE]: 'text-chart-2 bg-chart-2/20',
		[CardColor.GREEN]: 'text-primary bg-primary/20',
		[CardColor.YELLOW]: 'text-amber-300 bg-amber-300/20',
		[CardColor.ORANGE]: 'text-chart-4 bg-chart-4/20',
		[CardColor.RED]: 'text-chart-5 bg-chart-5/20',
		[CardColor.PINK]: 'text-chart-6 bg-chart-6/20',
	}

	private readonly typeLabels: Record<CardType, string> = {
		[CardType.CREDIT_CARD]: 'Credit Card',
		[CardType.DEBIT_CARD]: 'Debit Card',
	}

	readonly bgColorClass = computed(() => {
		const color = this.card().color || CardColor.GRAY
		return this.colorClasses[color]
	})

	readonly typeLabel = computed(() => {
		const type = this.card().type || CardType.CREDIT_CARD
		return this.typeLabels[type]
	})

	readonly creditLimit = computed(() => {
		const creditLimit = this.card().creditLimit
		if (!creditLimit) return null
		return Number(creditLimit)
	})

	readonly cardName = computed(() => this.card().name || 'Card Name')
	readonly lastFour = computed(() => this.card().lastFour)
	readonly expirationDate = computed(() => this.card().expirationDate)
	readonly cvc = computed(() => this.card().cvc)
}
