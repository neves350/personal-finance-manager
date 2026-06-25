import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	type TemplateRef,
	ViewEncapsulation,
	viewChild,
} from '@angular/core'

import type { ClassValue } from 'clsx'
import { mergeClasses } from '@/shared/utils/merge-classes'
import { dropdownContentVariants } from './dropdown.variants'

@Component({
	selector: 'z-dropdown-menu-content',
	template: `
    <ng-template #contentTemplate>
      <div [class]="contentClasses()" role="menu" tabindex="-1" aria-orientation="vertical">
        <ng-content />
      </div>
    </ng-template>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'[style.display]': '"none"',
	},
	exportAs: 'zDropdownMenuContent',
})
export class ZardDropdownMenuContentComponent {
	readonly contentTemplate =
		viewChild.required<TemplateRef<unknown>>('contentTemplate')

	readonly class = input<ClassValue>('')

	protected readonly contentClasses = computed(() =>
		mergeClasses(dropdownContentVariants(), this.class()),
	)
}
