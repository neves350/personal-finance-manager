import { NgTemplateOutlet } from '@angular/common'
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	model,
	output,
	TemplateRef,
	ViewEncapsulation,
} from '@angular/core'

import type { ClassValue } from 'clsx'

import {
	ZardButtonComponent,
	type ZardButtonSizeVariants,
	type ZardButtonTypeVariants,
} from '@/shared/components/ui/button'
import { ZardIconComponent } from '@/shared/components/ui/icon'
import {
	paginationContentVariants,
	paginationEllipsisVariants,
	paginationFirstVariants,
	paginationLastVariants,
	paginationNextVariants,
	paginationPreviousVariants,
	paginationVariants,
} from '@/shared/components/ui/pagination/pagination.variants'
import { mergeClasses } from '@/shared/utils/merge-classes'

@Component({
	selector: 'ul[z-pagination-content]',
	template: `
    <ng-content />
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'data-slot': 'pagination-content',
		'[class]': 'classes()',
	},
	exportAs: 'zPaginationContent',
})
export class ZardPaginationContentComponent {
	readonly class = input<ClassValue>('')

	protected readonly classes = computed(() =>
		mergeClasses(paginationContentVariants(), this.class()),
	)
}

@Component({
	selector: 'li[z-pagination-item]',
	template: `
    <ng-content />
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'data-slot': 'pagination-item',
	},
	exportAs: 'zPaginationItem',
})
export class ZardPaginationItemComponent {}
// Structural wrapper component for pagination items (<li>). No inputs required.

@Component({
	selector: 'button[z-pagination-button], a[z-pagination-button]',
	imports: [ZardButtonComponent],
	template: `
    <z-button
      [attr.data-active]="zActive() || null"
      [class]="class()"
      [zDisabled]="zDisabled()"
      [zSize]="zSize()"
      [zType]="zType()"
    >
      <ng-content />
    </z-button>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'data-slot': 'pagination-button',
	},
	exportAs: 'zPaginationButton',
})
export class ZardPaginationButtonComponent {
	readonly class = input<ClassValue>('')
	readonly zActive = input(false, { transform: booleanAttribute })
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zSize = input<ZardButtonSizeVariants>('default')

	protected readonly zType = computed<ZardButtonTypeVariants>(() =>
		this.zActive() ? 'outline' : 'ghost',
	)
}

@Component({
	selector: 'z-pagination-previous',
	imports: [ZardPaginationButtonComponent, ZardIconComponent],
	template: `
    <button
      type="button"
      z-pagination-button
      [attr.disabled]="zDisabled() ? '' : null"
      [class]="classes()"
      [zSize]="zSize()"
      [zDisabled]="zDisabled()"
    >
      <span class="sr-only">To previous page</span>
      <z-icon zType="chevron-left" aria-hidden="true" />
      <!-- <span class="hidden sm:block" aria-hidden="true">Previous</span> -->
    </button>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'zPaginationPrevious',
})
export class ZardPaginationPreviousComponent {
	readonly class = input<ClassValue>('')
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zSize = input<ZardButtonSizeVariants>('default')

	protected readonly classes = computed(() =>
		mergeClasses(paginationPreviousVariants(), this.class()),
	)
}

@Component({
	selector: 'z-pagination-next',
	imports: [ZardPaginationButtonComponent, ZardIconComponent],
	template: `
    <button
      type="button"
      z-pagination-button
      [attr.disabled]="zDisabled() ? '' : null"
      [class]="classes()"
      [zDisabled]="zDisabled()"
      [zSize]="zSize()"
    >
      <span class="sr-only">To next page</span>
      <z-icon zType="chevron-right" aria-hidden="true" />
    </button>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'zPaginationNext',
})
export class ZardPaginationNextComponent {
	readonly class = input<ClassValue>('')
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zSize = input<ZardButtonSizeVariants>('default')

	protected readonly classes = computed(() =>
		mergeClasses(paginationNextVariants(), this.class()),
	)
}

@Component({
	selector: 'z-pagination-first',
	imports: [ZardPaginationButtonComponent, ZardIconComponent],
	template: `
    <button
      type="button"
      z-pagination-button
      [attr.disabled]="zDisabled() ? '' : null"
      [class]="classes()"
      [zSize]="zSize()"
      [zDisabled]="zDisabled()"
    >
      <span class="sr-only">To first page</span>
      <z-icon zType="chevrons-left" aria-hidden="true" />
    </button>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'zPaginationFirst',
})
export class ZardPaginationFirstComponent {
	readonly class = input<ClassValue>('')
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zSize = input<ZardButtonSizeVariants>('default')

	protected readonly classes = computed(() =>
		mergeClasses(paginationFirstVariants(), this.class()),
	)
}

@Component({
	selector: 'z-pagination-last',
	imports: [ZardPaginationButtonComponent, ZardIconComponent],
	template: `
    <button
      type="button"
      z-pagination-button
      [attr.disabled]="zDisabled() ? '' : null"
      [class]="classes()"
      [zDisabled]="zDisabled()"
      [zSize]="zSize()"
    >
      <span class="sr-only">To last page</span>
      <z-icon zType="chevrons-right" aria-hidden="true" />
    </button>
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'zPaginationLast',
})
export class ZardPaginationLastComponent {
	readonly class = input<ClassValue>('')
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zSize = input<ZardButtonSizeVariants>('default')

	protected readonly classes = computed(() =>
		mergeClasses(paginationLastVariants(), this.class()),
	)
}

@Component({
	selector: 'z-pagination-ellipsis',
	imports: [ZardIconComponent],
	template: `
    <z-icon zType="ellipsis" aria-hidden="true" />
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'[class]': 'classes()',
		'aria-hidden': 'true',
	},
	exportAs: 'zPaginationEllipsis',
})
export class ZardPaginationEllipsisComponent {
	readonly class = input<ClassValue>('')

	protected readonly classes = computed(() =>
		mergeClasses(paginationEllipsisVariants(), this.class()),
	)
}

@Component({
	selector: 'z-pagination',
	imports: [
		ZardPaginationContentComponent,
		ZardPaginationItemComponent,
		ZardPaginationButtonComponent,
		ZardPaginationPreviousComponent,
		ZardPaginationNextComponent,
		ZardPaginationFirstComponent,
		ZardPaginationLastComponent,
		NgTemplateOutlet,
	],
	template: `
    @if (zType() === 'table') {
      <div class="flex w-full items-center justify-between text-sm text-muted-foreground">
        <span>Showing {{ showingFrom() }}-{{ showingTo() }} of {{ zTotalItems() }} items.</span>
        <div class="flex items-center gap-1">
          <span class="mr-2">Page {{ zPageIndex() }} of {{ zTotal() }}</span>
          <z-pagination-first
            [class]="'border'"
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === 1"
            (click)="goToPage(1)"
          />
          <z-pagination-previous
            [class]="'border'"
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === 1"
            (click)="goToPage(Math.max(1, zPageIndex() - 1))"
          />
          <z-pagination-next
            [class]="'border'"
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === zTotal()"
            (click)="goToPage(Math.min(zPageIndex() + 1, zTotal()))"
          />
          <z-pagination-last
            [class]="'border'"
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === zTotal()"
            (click)="goToPage(zTotal())"
          />
        </div>
      </div>
    } @else if (zContent()) {
      <ng-container *ngTemplateOutlet="zContent()" />
    } @else {
      <ul z-pagination-content>
        <li z-pagination-item>
          @let pagePrevious = Math.max(1, zPageIndex() - 1);
          <z-pagination-previous
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === 1"
            (click)="goToPage(pagePrevious)"
          />
        </li>

        @for (page of pages(); track page) {
          <li z-pagination-item>
            <button
              z-pagination-button
              type="button"
              class="focus-visible:rounded-md"
              [attr.aria-current]="page === zPageIndex() ? 'page' : null"
              [attr.aria-disabled]="zDisabled() || null"
              [zActive]="page === zPageIndex()"
              [zDisabled]="zDisabled()"
              [zSize]="zSize()"
              (click)="goToPage(page)"
            >
              <span class="sr-only">{{ pages().length === page ? 'To last page, page' : 'To page' }}</span>
              {{ page }}
            </button>
          </li>
        }

        <li z-pagination-item>
          @let pageNext = Math.min(zPageIndex() + 1, zTotal());
          <z-pagination-next
            [zSize]="zSize()"
            [zDisabled]="zDisabled() || zPageIndex() === zTotal()"
            (click)="goToPage(pageNext)"
          />
        </li>
      </ul>
    }
  `,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		role: 'group',
		'[attr.aria-label]': 'zAriaLabel()',
		'data-slot': 'pagination',
		'[class]': 'classes()',
	},
	exportAs: 'zPagination',
})
export class ZardPaginationComponent {
	readonly zPageIndex = model<number>(1)
	readonly zTotal = input<number>(1)
	readonly zSize = input<ZardButtonSizeVariants>('default')
	readonly zDisabled = input(false, { transform: booleanAttribute })
	readonly zContent = input<TemplateRef<void> | undefined>()
	readonly zAriaLabel = input('Pagination')
	readonly zType = input<'default' | 'table'>('default')
	readonly zPageSize = input<number>(10)
	readonly zTotalItems = input<number>(0)

	readonly class = input<ClassValue>('')

	readonly zPageIndexChange = output<number>()
	readonly Math = Math

	protected readonly classes = computed(() =>
		mergeClasses(paginationVariants(), this.class()),
	)
	readonly pages = computed<number[]>(() =>
		Array.from({ length: Math.max(0, this.zTotal()) }, (_, i) => i + 1),
	)
	protected readonly showingFrom = computed(
		() => (this.zPageIndex() - 1) * this.zPageSize(),
	)
	protected readonly showingTo = computed(() =>
		Math.min(this.zPageIndex() * this.zPageSize(), this.zTotalItems()),
	)

	goToPage(page: number): void {
		if (!this.zDisabled() && page !== this.zPageIndex()) {
			this.zPageIndex.set(page)
			this.zPageIndexChange.emit(page)
		}
	}
}
