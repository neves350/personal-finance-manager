import {
	type AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	output,
	signal,
	viewChild,
} from '@angular/core'
import {
	PeriodType,
	type StatisticsQueryParams,
} from '@core/api/statistics.interface'
import { ZardDateRangePickerComponent } from '../../ui/date-picker'
import { ZardTabComponent, ZardTabGroupComponent } from '../../ui/tabs'

const TAB_PERIODS = [PeriodType.WEEK, PeriodType.MONTH, PeriodType.YEAR]
const DEFAULT_TAB_INDEX = 1 // 1M

@Component({
	selector: 'app-statistics-filter',
	imports: [
		ZardTabGroupComponent,
		ZardTabComponent,
		ZardDateRangePickerComponent,
	],
	templateUrl: './statistics-filter.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsFilter implements AfterViewInit {
	readonly period = signal<PeriodType>(PeriodType.MONTH)
	readonly filterChange = output<StatisticsQueryParams>()

	private initialized = false
	private readonly tabGroup =
		viewChild<ZardTabGroupComponent>('tabGroup')
	private readonly dateRangePicker =
		viewChild<ZardDateRangePickerComponent>('dateRangePicker')

	ngAfterViewInit() {
		this.tabGroup()?.selectTabByIndex(DEFAULT_TAB_INDEX)
		// Skip initial zTabChange emissions from tab group init
		this.initialized = true
	}

	onTabChange(event: { index: number; label: string }) {
		if (!this.initialized) return

		const period = TAB_PERIODS[event.index]
		if (period) {
			this.period.set(period)
			this.dateRangePicker()?.clearRange()
			this.filterChange.emit({ period })
		}
	}

	onRangeChange(range: { startDate: Date; endDate: Date } | null) {
		if (range) {
			this.filterChange.emit({
				startDate: this.toISODate(range.startDate),
				endDate: this.toISODate(range.endDate),
			})
		}
	}

	private toISODate(date: Date): string {
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		return `${y}-${m}-${d}`
	}
}
