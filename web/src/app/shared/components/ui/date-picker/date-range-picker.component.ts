import { DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	model,
	output,
	signal,
	ViewEncapsulation,
	viewChild,
} from '@angular/core'

import type { ClassValue } from 'clsx'

import { ZardButtonComponent } from '@/shared/components/ui/button/button.component'
import type { ZardButtonSizeVariants } from '@/shared/components/ui/button/button.variants'
import { ZardCalendarComponent } from '@/shared/components/ui/calendar/calendar.component'
import type { CalendarValue } from '@/shared/components/ui/calendar/calendar.types'
import { ZardIconComponent } from '@/shared/components/ui/icon/icon.component'
import {
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '@/shared/components/ui/popover/popover.component'
import { mergeClasses } from '@/shared/utils/merge-classes'

const HEIGHT_BY_SIZE: Record<NonNullable<ZardButtonSizeVariants>, string> = {
	sm: 'h-8',
	default: 'h-10',
	lg: 'h-12',
}

@Component({
	selector: 'z-date-range-picker, [z-date-range-picker]',
	imports: [
		ZardButtonComponent,
		ZardCalendarComponent,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardIconComponent,
	],
	standalone: true,
	template: `
		<button
			z-button
			type="button"
			zType="outline"
			[zSize]="zSize()"
			[disabled]="disabled()"
			[class]="buttonClasses()"
			zPopover
			#popoverDirective="zPopover"
			[zContent]="rangeTemplate"
			zTrigger="click"
			(zVisibleChange)="onPopoverVisibilityChange($event)"
			[attr.aria-expanded]="false"
			[attr.aria-haspopup]="true"
			aria-label="Choose date range"
		>
			<z-icon zType="calendar" />
			<span [class]="textClasses()">
				{{ displayText() }}
			</span>
		</button>

		<ng-template #rangeTemplate>
			<z-popover class="w-auto p-0">
				<div class="flex p-3 bg-background rounded-lg">
					<z-calendar
						#leftCalendar
						zMode="range"
						class="border-0"
						[value]="rangeValue()"
						[disabled]="disabled()"
						(dateChange)="onDateChange($event)"
					/>
					<z-calendar
						#rightCalendar
						zMode="range"
						class="border-0"
						[value]="rangeValue()"
						[disabled]="disabled()"
						(dateChange)="onDateChange($event)"
					/>
				</div>
			</z-popover>
		</ng-template>
	`,
	providers: [DatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	host: {
		'[class]': 'class()',
	},
	exportAs: 'zDateRangePicker',
})
export class ZardDateRangePickerComponent {
	private readonly datePipe = inject(DatePipe)

	private readonly leftCalendar =
		viewChild<ZardCalendarComponent>('leftCalendar')
	private readonly rightCalendar =
		viewChild<ZardCalendarComponent>('rightCalendar')
	private readonly popoverDirective =
		viewChild.required<ZardPopoverDirective>('popoverDirective')

	readonly class = input<ClassValue>('')
	readonly zSize = input<ZardButtonSizeVariants>('default')
	readonly placeholder = input<string>('Pick a date range')
	readonly zFormat = input<string>('MMM d, yyyy')
	readonly disabled = model<boolean>(false)

	readonly rangeValue = model<CalendarValue>(null)
	readonly rangeChange = output<{
		startDate: Date
		endDate: Date
	} | null>()

	private readonly popoverVisible = signal(false)

	protected readonly buttonClasses = computed(() => {
		const hasValue = this.hasRange()
		const height = HEIGHT_BY_SIZE[this.zSize()]
		return mergeClasses(
			'justify-start text-left font-normal',
			!hasValue && 'text-muted-foreground',
			height,
			'w-full',
		)
	})

	protected readonly textClasses = computed(() => {
		const hasValue = this.hasRange()
		return mergeClasses(!hasValue && 'text-muted-foreground')
	})

	private readonly hasRange = computed(() => {
		const val = this.rangeValue()
		return Array.isArray(val) && val.length === 2
	})

	protected readonly displayText = computed(() => {
		const val = this.rangeValue()
		if (Array.isArray(val) && val.length === 2) {
			const fmt = this.zFormat()
			return `${this.formatDate(val[0], fmt)} - ${this.formatDate(val[1], fmt)}`
		}
		if (Array.isArray(val) && val.length === 1) {
			return `${this.formatDate(val[0], this.zFormat())} - ...`
		}
		return this.placeholder()
	})

	constructor() {
		effect(() => {
			if (this.popoverVisible()) {
				setTimeout(() => this.syncRightCalendar(), 0)
			}
		})
	}

	protected onPopoverVisibilityChange(visible: boolean): void {
		this.popoverVisible.set(visible)
		if (visible) {
			setTimeout(() => {
				this.leftCalendar()?.resetNavigation()
				this.syncRightCalendar()
			})
		}
	}

	protected onDateChange(value: CalendarValue): void {
		this.rangeValue.set(value)

		if (Array.isArray(value) && value.length === 2) {
			this.rangeChange.emit({
				startDate: value[0],
				endDate: value[1],
			})
			setTimeout(() => this.popoverDirective().hide(), 200)
		}

		setTimeout(() => this.syncRightCalendar(), 0)
	}

	clearRange(): void {
		this.rangeValue.set(null)
		this.rangeChange.emit(null)
	}

	private syncRightCalendar(): void {
		const left = this.leftCalendar()
		const right = this.rightCalendar()
		if (!left || !right) return

		// Access the linkedSignal values from the calendar component
		// biome-ignore lint/suspicious/noExplicitAny: accessing protected internal signals
		const leftRef = left as any
		// biome-ignore lint/suspicious/noExplicitAny: accessing protected internal signals
		const rightRef = right as any

		const leftMonthStr = leftRef.currentMonthValue?.()
		const leftYearStr = leftRef.currentYearValue?.()

		if (leftMonthStr == null || leftYearStr == null) return

		const leftMonth = Number.parseInt(leftMonthStr, 10)
		const leftYear = Number.parseInt(leftYearStr, 10)

		const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1
		const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear

		rightRef.currentMonthValue?.set(rightMonth.toString())
		rightRef.currentYearValue?.set(rightYear.toString())
	}

	private formatDate(date: Date, format: string): string {
		return this.datePipe.transform(date, format) ?? ''
	}
}
