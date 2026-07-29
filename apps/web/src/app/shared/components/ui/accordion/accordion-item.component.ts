import {
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChild,
	input,
	signal,
	ViewEncapsulation,
} from '@angular/core'

import type { ClassValue } from 'clsx'

import type { ZardAccordionComponent } from '@/shared/components/ui/accordion/accordion.component'
import {
	accordionContentVariants,
	accordionItemVariants,
	accordionTriggerVariants,
} from '@/shared/components/ui/accordion/accordion.variants'
import { ZardAccordionTriggerDirective } from '@/shared/components/ui/accordion/accordion-trigger.directive'
import { ZardIconComponent } from '@/shared/components/ui/icon'
import { mergeClasses } from '@/shared/utils/merge-classes'

@Component({
	selector: 'z-accordion-item',
	imports: [ZardIconComponent],
	template: `
    <button
      type="button"
      [attr.aria-controls]="'content-' + zValue()"
      [attr.aria-expanded]="isOpen()"
      [id]="'accordion-' + zValue()"
      [class]="triggerClasses()"
      (click)="toggle()"
    >
		@if (hasCustomTrigger()) {
			<ng-content select="[zAccordionTrigger]" />
		} @else {
			{{ zTitle() }}
		}
		<z-icon
			zType="chevron-down"
			class="text-muted-foreground pointer-events-none size-5 shrink-0 translate-y-1 transition-transform duration-500"
			[class]="isOpen() ? 'rotate-180' : ''"
		/>
    </button>

    <div
      role="region"
      [attr.aria-labelledby]="'accordion-' + zValue()"
      [attr.data-state]="isOpen() ? 'open' : 'closed'"
      [id]="'content-' + zValue()"
      [class]="contentClasses()"
    >
      <div class="overflow-hidden">
        <div class="pt-2 pb-2">
          <ng-content />
        </div>
      </div>
    </div>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'[class]': 'itemClasses()',
		'[attr.data-state]': "isOpen() ? 'open' : 'closed'",
	},
	exportAs: 'zAccordionItem',
})
export class ZardAccordionItemComponent {
	readonly zTitle = input<string>('')
	readonly zValue = input<string>('')
	readonly class = input<ClassValue>('')

	private readonly customTrigger = contentChild(ZardAccordionTriggerDirective)
	protected readonly hasCustomTrigger = computed(() => !!this.customTrigger())

	accordion!: ZardAccordionComponent
	readonly isOpen = signal(false)

	protected readonly itemClasses = computed(() =>
		mergeClasses(accordionItemVariants(), this.class()),
	)
	protected readonly triggerClasses = computed(() =>
		mergeClasses(accordionTriggerVariants()),
	)
	protected readonly contentClasses = computed(() =>
		mergeClasses(accordionContentVariants({ isOpen: this.isOpen() })),
	)

	toggle(): void {
		if (this.accordion) {
			this.accordion.toggleItem(this)
		} else {
			this.isOpen.update((v) => !v)
		}
	}
}
