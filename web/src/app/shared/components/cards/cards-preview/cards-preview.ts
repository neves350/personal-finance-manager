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
		[CardColor.GRAY]: 'bg-zinc-700',
		[CardColor.PURPLE]: 'bg-violet-700',
		[CardColor.BLUE]: 'bg-sky-500',
		[CardColor.GREEN]: 'bg-emerald-700',
		[CardColor.YELLOW]: 'bg-yellow-400',
		[CardColor.ORANGE]: 'bg-amber-500',
		[CardColor.RED]: 'bg-red-500',
		[CardColor.PINK]: 'bg-fuchsia-300',
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
