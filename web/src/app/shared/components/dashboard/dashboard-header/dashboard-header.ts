import {
	ChangeDetectionStrategy,
	Component,
	inject,
	output,
	signal,
} from '@angular/core'
import {
	PeriodType,
	type StatisticsQueryParams,
} from '@core/api/statistics.interface'
import { AuthService } from '@core/services/auth.service'
import {
	ArrowRightLeftIcon,
	CalendarDaysIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { TransactionsForm } from '../../transactions/transactions-form/transactions-form'
import { TransfersForm } from '../../transfers/transfers-form/transfers-form'
import { ZardButtonComponent } from '../../ui/button'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import { ZardSheetService } from '../../ui/sheet'

@Component({
	selector: 'app-dashboard-header',
	imports: [
		ZardButtonComponent,
		LucideAngularModule,
		ZardSelectComponent,
		ZardSelectItemComponent,
	],
	templateUrl: './dashboard-header.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader {
	private readonly sheetService = inject(ZardSheetService)
	private readonly authService = inject(AuthService)

	readonly user = this.authService.currentUser
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly PlusIcon = PlusIcon
	readonly CalendarDaysIcon = CalendarDaysIcon

	readonly period = signal<PeriodType>(PeriodType.MONTH)
	readonly filterChange = output<StatisticsQueryParams>()

	onPeriodChange(value: string | string[]) {
		this.period.set(value as PeriodType)
		this.emitFilter()
	}

	openTransfer() {
		this.sheetService.create({
			zTitle: 'New Transfer',
			zContent: TransfersForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Send Transfer',
			zOnOk: (instance: TransfersForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	openTransaction() {
		this.sheetService.create({
			zTitle: 'New Transaction',
			zContent: TransactionsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create Transaction',
			zOnOk: (instance: TransactionsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	private emitFilter() {
		this.filterChange.emit({
			period: this.period(),
		})
	}

	get greeting(): string {
		const hour = new Date().getHours()

		if (hour < 12) return 'Good morning'
		if (hour < 18) return 'Good afternoon'
		return 'Good evening'
	}
}
