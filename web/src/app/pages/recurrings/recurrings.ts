import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RecurringsService } from '@core/services/recurrings.service'
import {
	CircleAlertIcon,
	LucideAngularModule,
	PlusIcon,
	RepeatIcon,
} from 'lucide-angular'
import { RecurringsCard } from '@/shared/components/recurrings/recurrings-card/recurrings-card'
import { RecurringsForm } from '@/shared/components/recurrings/recurrings-form/recurrings-form'
import { RecurringsSummary } from '@/shared/components/recurrings/recurrings-summary/recurrings-summary'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import {
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '@/shared/components/ui/popover'
import { ZardSheetService } from '@/shared/components/ui/sheet'

@Component({
	selector: 'app-recurrings',
	imports: [
		ZardButtonComponent,
		LucideAngularModule,
		ZardCardComponent,
		ZardPopoverDirective,
		ZardPopoverComponent,
		RecurringsCard,
		ZardLoaderComponent,
		RecurringsSummary,
	],
	templateUrl: './recurrings.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recurrings {
	private readonly recurringsService = inject(RecurringsService)
	private readonly sheetService = inject(ZardSheetService)

	readonly recurrings = this.recurringsService.recurrings
	readonly hasRecurrings = this.recurringsService.hasRecurrings
	readonly isLoading = this.recurringsService.loading

	readonly PlusIcon = PlusIcon
	readonly RepeatIcon = RepeatIcon
	readonly CircleAlertIcon = CircleAlertIcon

	constructor() {
		this.recurringsService.loadRecurrings().subscribe()
	}

	openDialog() {
		this.sheetService.create({
			zTitle: 'New Recurring Transaction',
			zContent: RecurringsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create recurring',
			zOnOk: (instance: RecurringsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
