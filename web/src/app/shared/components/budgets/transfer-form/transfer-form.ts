import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { BudgetsService } from '@core/services/budgets.service'
import {
	CircleArrowDownIcon,
	EuroIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import type { iTransferData } from './transfer-form.interface'

@Component({
	selector: 'app-transfer-form',
	imports: [
		ReactiveFormsModule,
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		LucideAngularModule,
		CurrencyPipe,
	],
	templateUrl: './transfer-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferForm {
	private readonly zData: iTransferData = inject(Z_MODAL_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly budgetsService = inject(BudgetsService)
	private readonly dialogRef = inject(ZardDialogRef)

	readonly CircleArrowDownIcon = CircleArrowDownIcon
	readonly EuroIcon = EuroIcon

	readonly envelopes = this.budgetsService.envelopes

	form = this.fb.nonNullable.group({
		fromEnvelopeId: ['', [Validators.required]],
		toEnvelopeId: ['', [Validators.required]],
		amount: [
			null as number | null,
			[Validators.required, Validators.min(0.01)],
		],
	})

	readonly selectedFromEnvelope = computed(() => {
		const id = this.form.controls.fromEnvelopeId.value
		return this.envelopes().find((e) => e.id === id)
	})

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()

		if (formValue.fromEnvelopeId === formValue.toEnvelopeId) {
			toast.error('Source and destination must be different')
			return
		}

		this.budgetsService
			.transferEnvelopes(this.zData.budgetId, {
				fromEnvelopeId: formValue.fromEnvelopeId,
				toEnvelopeId: formValue.toEnvelopeId,
				amount: Number(formValue.amount),
			})
			.subscribe({
				next: () => {
					toast.success('Transfer completed successfully')
					this.dialogRef.close()
				},
				error: (err) => {
					toast.error(
						err.error?.message || 'Failed to transfer between envelopes',
					)
				},
			})
	}
}
