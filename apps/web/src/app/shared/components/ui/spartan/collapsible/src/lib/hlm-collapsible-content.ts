import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import {
	BrnCollapsible,
	BrnCollapsibleContent,
} from '@spartan-ng/brain/collapsible'
import { classes } from '@spartan-ng/helm/utils'

@Component({
	selector: '[hlmCollapsibleContent],hlm-collapsible-content',
	hostDirectives: [BrnCollapsibleContent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'collapsible-content',
		'[attr.data-state]': 'state()',
	},
	template: `
		<div class="min-h-0 overflow-hidden">
			<ng-content />
		</div>
	`,
})
export class HlmCollapsibleContent {
	protected readonly _collapsible = inject(BrnCollapsible, { optional: true })
	protected readonly state = computed(
		() => this._collapsible?.state() ?? 'open',
	)

	constructor() {
		classes(
			() =>
				'grid overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]',
		)
	}
}
