import { CurrencyPipe } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { GoalsService } from '@core/services/goals.service'
import { CalendarIcon, EuroIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardInputDirective } from '../../ui/input'
import type { iDepositSheetData } from './goals-deposit-form.interface'

@Component({
	selector: 'app-goals-deposit-form',
	imports: [
		ReactiveFormsModule,
		ZardDatePickerComponent,
		ZardInputDirective,
		LucideAngularModule,
		CurrencyPipe,
	],
	templateUrl: './goals-deposit-form.html',
})
export class GoalsDepositForm {
	private readonly goalsService = inject(GoalsService)
	private readonly zData: iDepositSheetData = inject(Z_MODAL_DATA)
	private readonly dialogRef = inject(ZardDialogRef)
	private readonly fb = inject(FormBuilder)

	readonly CalendarIcon = CalendarIcon
	readonly EuroIcon = EuroIcon

	readonly selectedDate: Date | null = new Date()
	readonly goal = this.zData?.goal

	get formattedRemaining() {
		if (!this.goal) return ''
		const remaining = this.goal.amount - this.goal.currentAmount

		return Math.max(0, remaining)
	}

	form = this.fb.nonNullable.group({
		amount: [0 as number | null, [Validators.required, Validators.min(0.01)]],
		date: ['', [Validators.required]],
		note: [''],
	})

	constructor() {
		// Initialize date with the default selectedDate
		if (this.selectedDate) {
			this.form.controls.date.setValue(this.selectedDate.toISOString())
		}

		if (this.zData) {
			const patch: { amount?: number; date?: string; note?: string } = {}

			if (typeof this.zData.amount === 'number')
				patch.amount = this.zData.amount
			if (this.zData.date) patch.date = this.zData.date
			if (this.zData.note) patch.note = this.zData.note

			this.form.patchValue(patch)
		}
	}

	onDateChange(date: Date | null) {
		this.form.controls.date.setValue(date ? date.toISOString() : '')
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const goalId = this.zData?.id
		if (!goalId) return

		const formValue = this.form.getRawValue()
		const payload = {
			amount: Number(formValue.amount) || 0,
			date: formValue.date,
			note: formValue.note,
		}

		this.goalsService.addDeposit(goalId, payload).subscribe({
			next: () => {
				toast.success('Deposit created successfully')
				this.dialogRef.close()
			},
			error: (error) => {
				toast.error(
					error.error?.message || error.message || 'Failed to create deposit',
				)
			},
		})
	}
}
