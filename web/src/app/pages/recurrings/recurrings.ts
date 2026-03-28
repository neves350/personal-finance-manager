import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { RecurringsService } from '@core/services/recurrings.service'
import {
	CircleAlertIcon,
	LucideAngularModule,
	PlusIcon,
	RepeatIcon,
	SparklesIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { RecurringsCard } from '@/shared/components/recurrings/recurrings-card/recurrings-card'
import { RecurringsForm } from '@/shared/components/recurrings/recurrings-form/recurrings-form'
import { RecurringsSummary } from '@/shared/components/recurrings/recurrings-summary/recurrings-summary'
import { ZardBadgeComponent } from '@/shared/components/ui/badge'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import {
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '@/shared/components/ui/popover'
import {
	ZardSegmentedComponent,
	type SegmentedOption,
} from '@/shared/components/ui/segmented'
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
		ZardSegmentedComponent,
		ZardBadgeComponent,
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

	readonly activeTab = signal<string>('all')

	readonly detectedRecurrings = computed(() =>
		this.recurrings().filter((r) => r.autoDetected),
	)

	readonly hasDetected = computed(() => this.detectedRecurrings().length > 0)

	readonly tabOptions = computed<SegmentedOption[]>(() => [
		{ value: 'all', label: 'All' },
		{
			value: 'detected',
			label: `Detected${this.detectedRecurrings().length > 0 ? ` (${this.detectedRecurrings().length})` : ''}`,
		},
	])

	readonly PlusIcon = PlusIcon
	readonly RepeatIcon = RepeatIcon
	readonly CircleAlertIcon = CircleAlertIcon
	readonly SparklesIcon = SparklesIcon
	readonly Trash2Icon = Trash2Icon

	constructor() {
		this.recurringsService.loadRecurrings().subscribe()
	}

	async confirmRecurring(id: string) {
		try {
			await lastValueFrom(this.recurringsService.confirm(id))
			toast.success('Recurring confirmed')
		} catch {
			toast.error('Failed to confirm recurring')
		}
	}

	async ignoreRecurring(id: string) {
		try {
			await lastValueFrom(this.recurringsService.delete(id))
			toast.success('Recurring dismissed')
		} catch {
			toast.error('Failed to dismiss recurring')
		}
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
