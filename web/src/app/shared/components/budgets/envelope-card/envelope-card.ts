import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import type { Envelope } from '@core/api/budgets.interface'
import { BudgetsService } from '@core/services/budgets.service'
import {
	EllipsisIcon,
	LucideAngularModule,
	SquarePenIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardPopoverComponent, ZardPopoverDirective } from '../../ui/popover'
import { ZardProgressBarComponent } from '../../ui/progress-bar'
import { EnvelopeForm } from '../envelope-form/envelope-form'
import type { iEnvelopeData } from '../envelope-form/envelope-form.interface'

@Component({
	selector: 'app-envelope-card',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		ZardProgressBarComponent,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardDividerComponent,
		CurrencyPipe,
	],
	templateUrl: './envelope-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvelopeCard {
	private readonly dialogService = inject(ZardDialogService)
	private readonly budgetsService = inject(BudgetsService)

	readonly envelope = input.required<Envelope>()
	readonly budgetId = input.required<string>()

	readonly EllipsisIcon = EllipsisIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon

	readonly progressType = computed(() => {
		const status = this.envelope().status
		if (status === 'overspent') return 'destructive' as const
		if (status === 'warning') return 'accent' as const
		return 'default' as const
	})

	readonly statusBadge = computed(() => {
		const map = {
			on_track: {
				label: 'On Track',
				color: 'text-primary',
				dot: 'bg-primary',
			},
			warning: {
				label: 'Warning',
				color: 'text-chart-1',
				dot: 'bg-chart-1',
			},
			overspent: {
				label: 'Overspent',
				color: 'text-destructive',
				dot: 'bg-destructive',
			},
		}
		return map[this.envelope().status]
	})

	editEnvelope() {
		this.dialogService.create({
			zTitle: 'Edit Envelope',
			zContent: EnvelopeForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: EnvelopeForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				budgetId: this.budgetId(),
				envelopeId: this.envelope().id,
				categoryId: this.envelope().categoryId,
				allocatedAmount: this.envelope().allocatedAmount,
			} as iEnvelopeData,
		})
	}

	deleteEnvelope() {
		const envelope = this.envelope()

		this.dialogService.create({
			zTitle: 'Remove envelope?',
			zDescription: `Are you sure you want to remove the "${envelope.category.title}" envelope? This action cannot be undone.`,
			zCancelText: 'Cancel',
			zOkText: 'Remove',
			zOkDestructive: true,
			zWidth: '500px',
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(
						this.budgetsService.removeEnvelope(this.budgetId(), envelope.id),
					)
					toast.success(message)
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to remove envelope')
					return false
				}
			},
		})
	}
}
