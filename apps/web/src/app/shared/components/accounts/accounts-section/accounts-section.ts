import { CurrencyPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
	ZardAccordionComponent,
	ZardAccordionItemComponent,
	ZardAccordionTriggerDirective,
} from '../../ui/accordion'

@Component({
	selector: 'app-accounts-section',
	imports: [
		CurrencyPipe,
		LucideAngularModule,
		ZardAccordionComponent,
		ZardAccordionItemComponent,
		ZardAccordionTriggerDirective,
	],
	templateUrl: './accounts-section.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsSection {
	readonly title = input.required<string>()
	readonly count = input.required<number>()
	readonly total = input.required<number>()
	readonly showTotal = input<boolean>(true)
}
