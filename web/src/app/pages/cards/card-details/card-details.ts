import { Component, DestroyRef, effect, inject, input } from '@angular/core'
import type { Card } from '@core/api/cards.interface'
import { CardHeader } from '@/shared/components/cards/cards-details/card-header/card-header'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'

@Component({
	selector: 'app-card-details',
	imports: [CardHeader],
	templateUrl: './card-details.html',
})
export class CardDetails {
	readonly card = input.required<Card>()

	private readonly service = inject(BreadcrumbService)
	private readonly destroyRef = inject(DestroyRef)

	constructor() {
		effect(() => this.service.set(this.card().name))
		this.destroyRef.onDestroy(() => this.service.clear())
	}
}
