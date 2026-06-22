import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import type { Envelope } from '@core/api/budgets.interface'
import { EnvelopeCard } from '../envelope-card/envelope-card'

@Component({
	selector: 'app-envelope-list',
	imports: [EnvelopeCard],
	templateUrl: './envelope-list.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvelopeList {
	readonly envelopes = input.required<Envelope[]>()
	readonly budgetId = input.required<string>()
}
