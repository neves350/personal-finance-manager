import { Directive, inject } from '@angular/core'
import { BrnCollapsible } from '@spartan-ng/brain/collapsible'

@Directive({
	selector: '[hlmCollapsible],hlm-collapsible',
	hostDirectives: [
		{
			directive: BrnCollapsible,
			inputs: ['expanded', 'disabled'],
			outputs: ['expandedChange'],
		},
	],
	host: {
		'data-slot': 'collapsible',
		'[attr.data-state]': '_collapsible.state()',
	},
})
export class HlmCollapsible {
	protected readonly _collapsible = inject(BrnCollapsible)
}
