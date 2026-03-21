import { CurrencyPipe, TitleCasePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	inject,
	input,
} from '@angular/core'
import {
	FrequencyType,
	Recurring,
	RecurringType,
} from '@core/api/recurrings.interface'
import { RecurringsService } from '@core/services/recurrings.service'
import {
	CircleArrowDownIcon,
	CircleArrowUpIcon,
	LucideAngularModule,
	type LucideIconData,
	PencilIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import {
	ZardAccordionComponent,
	ZardAccordionItemComponent,
	ZardAccordionTriggerDirective,
} from '../../ui/accordion'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'
import { RecurringsForm } from '../recurrings-form/recurrings-form'
import type { iRecurringSheetData } from '../recurrings-form/recurrings-form.interface'
import { DeleteRecurringDialog } from './delete-recurring-dialog'

@Component({
	selector: 'app-recurrings-card',
	imports: [
		ZardAccordionComponent,
		ZardAccordionItemComponent,
		ZardAccordionTriggerDirective,
		ZardBadgeComponent,
		ZardButtonComponent,
		LucideAngularModule,
		CurrencyPipe,
		TitleCasePipe,
	],
	templateUrl: './recurrings-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecurringsCard {
	readonly recurrings = input.required<Recurring[]>()

	private readonly dialogService = inject(ZardDialogService)
	private readonly recurringsService = inject(RecurringsService)

	readonly PencilIcon = PencilIcon
	readonly Trash2Icon = Trash2Icon

	private readonly typeMap: Record<
		RecurringType,
		{
			icon: LucideIconData
			style: string
			cost: string
			sign: string
		}
	> = {
		[RecurringType.INCOME]: {
			icon: CircleArrowUpIcon,
			style: 'bg-primary/10 text-primary',
			cost: 'text-primary',
			sign: '+',
		},
		[RecurringType.EXPENSE]: {
			icon: CircleArrowDownIcon,
			style: 'bg-destructive/10 text-destructive',
			cost: 'text-destructive',
			sign: '-',
		},
	}

	typeInfo(r: Recurring) {
		return this.typeMap[r.type]
	}

	monthlyCost(r: Recurring): number {
		const amount = Number(r.amount)
		return r.frequency === FrequencyType.ANNUAL ? amount / 12 : amount
	}

	annualCost(r: Recurring): number {
		const amount = Number(r.amount)
		return r.frequency === FrequencyType.MONTH ? amount * 12 : amount
	}

	editRecurring(recurring: Recurring) {
		this.dialogService.create({
			zTitle: 'Edit Recurring Transaction',
			zContent: RecurringsForm,
			zWidth: '600px',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: RecurringsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5 border-4',
			zData: {
				id: recurring.id,
				type: recurring.type,
				description: recurring.description,
				amount: recurring.amount,
				monthDay: recurring.monthDay,
				frequency: recurring.frequency,
				categoryId: recurring.categoryId,
				paymentMethod: recurring.paymentMethod,
				cardId: recurring.cardId,
				bankAccountId: recurring.bankAccountId,
				startDate: recurring.startDate,
				endDate: recurring.endDate,
			} as unknown as iRecurringSheetData,
		})
	}

	deleteRecurring(recurring: Recurring) {
		const recurringId = recurring.id
		if (!recurringId) return

		return this.dialogService.create({
			zTitle: 'Remove recurring transaction',
			zContent: DeleteRecurringDialog,
			zCancelText: 'Cancel',
			zOkText: 'Delete Recurring',
			zWidth: '500px',
			zOkDestructive: true,
			zData: { description: recurring.description },
			zOnOk: async (instance: DeleteRecurringDialog) => {
				try {
					const message = await lastValueFrom(
						this.recurringsService.delete(
							recurringId,
							instance.deleteTransactions(),
						),
					)
					toast.success(message)
					this.recurringsService.loadRecurrings().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(
						error.error?.message || 'Failed to delete recurring transaction.',
					)
					return false
				}
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
