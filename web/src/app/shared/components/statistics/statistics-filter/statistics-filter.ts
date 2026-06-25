import {
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
import {
	type SegmentedOption,
	ZardSegmentedComponent,
} from '../../ui/segmented'

const PERIOD_MAP: Record<string, PeriodType> = {
	[PeriodType.WEEK]: PeriodType.WEEK,
	[PeriodType.MONTH]: PeriodType.MONTH,
	[PeriodType.YEAR]: PeriodType.YEAR,
}

@Component({
	selector: 'app-statistics-filter',
	imports: [ZardSegmentedComponent, ZardDateRangePickerComponent],
	templateUrl: './statistics-filter.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsFilter {
	readonly period = signal<PeriodType>(PeriodType.MONTH)
	readonly filterChange = output<StatisticsQueryParams>()

	private readonly segmented = viewChild<ZardSegmentedComponent>('segmented')
	private readonly dateRangePicker =
		viewChild<ZardDateRangePickerComponent>('dateRangePicker')

	readonly periodOptions: SegmentedOption[] = [
		{ value: PeriodType.WEEK, label: '1W' },
		{ value: PeriodType.MONTH, label: '1M' },
		{ value: PeriodType.YEAR, label: '1Y' },
	]

	readonly defaultPeriod = PeriodType.MONTH

	onPeriodChange(value: string) {
		const period = PERIOD_MAP[value]
		if (period) {
			this.period.set(period)
			this.dateRangePicker()?.clearRange()
			this.filterChange.emit({ period })
		}
	}

	onRangeChange(range: { startDate: Date; endDate: Date } | null) {
		if (range) {
			this.segmented()?.clearSelection()
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
