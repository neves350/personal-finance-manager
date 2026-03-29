import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	input,
	signal,
} from '@angular/core'
import { ChevronDownIcon, LucideAngularModule } from 'lucide-angular'
import { ZardDividerComponent } from '../../ui/divider'

@Component({
	selector: 'app-accounts-section',
	imports: [CurrencyPipe, LucideAngularModule, ZardDividerComponent],
	templateUrl: './accounts-section.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsSection {
	readonly title = input.required<string>()
	readonly count = input.required<number>()
	readonly total = input.required<number>()

	readonly ChevronDownIcon = ChevronDownIcon
	readonly collapsed = signal(false)

	toggle() {
		this.collapsed.update((v) => !v)
	}
}
