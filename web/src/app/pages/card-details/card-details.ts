import {
	Component,
	DestroyRef,
	effect,
	inject,
	input,
	signal,
} from '@angular/core'
import type { Card } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import { CardCashflow } from '@/shared/components/cards/cards-details/card-cashflow/card-cashflow'
import { CardHeader } from '@/shared/components/cards/cards-details/card-header/card-header'
import { CardRecent } from '@/shared/components/cards/cards-details/card-recent/card-recent'
import { CardSummary } from '@/shared/components/cards/cards-details/card-summary/card-summary'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'

@Component({
	selector: 'app-card-details',
	imports: [CardHeader, CardSummary, CardCashflow, CardRecent],
	templateUrl: './card-details.html',
})
export class CardDetails {
	readonly card = input.required<Card>()
	readonly currentCard = signal<Card | null>(null)

	private readonly breadcrumbService = inject(BreadcrumbService)
	private readonly cardsService = inject(CardsService)
	private readonly destroyRef = inject(DestroyRef)

	constructor() {
		effect(() => {
			const card = this.currentCard() ?? this.card()
			this.breadcrumbService.set(card.name)
		})
		this.destroyRef.onDestroy(() => this.breadcrumbService.clear())
	}

	get activeCard(): Card {
		return this.currentCard() ?? this.card()
	}

	refreshCard() {
		const cardId = this.card().id
		if (!cardId) return
		this.cardsService.findById(cardId).subscribe((card) => {
			this.currentCard.set(card)
		})
	}
}
