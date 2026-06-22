import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { BudgetsService } from '@core/services/budgets.service'
import { CategoriesService } from '@core/services/categories.service'
import { EuroIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import type { iEnvelopeData } from './envelope-form.interface'

@Component({
	selector: 'app-envelope-form',
	imports: [
		ReactiveFormsModule,
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		LucideAngularModule,
	],
	templateUrl: './envelope-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvelopeForm {
	private readonly zData: iEnvelopeData = inject(Z_MODAL_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly budgetsService = inject(BudgetsService)
	private readonly categoriesService = inject(CategoriesService)
	private readonly dialogRef = inject(ZardDialogRef)

	readonly EuroIcon = EuroIcon
	readonly isEditMode = computed(() => !!this.zData?.envelopeId)

	private readonly usedCategoryIds = computed(() =>
		this.budgetsService.envelopes().map((e) => e.categoryId),
	)

	readonly availableCategories = computed(() => {
		const used = this.usedCategoryIds()
		const editingCategoryId = this.zData?.categoryId
		return this.categoriesService
			.expenseCategories()
			.filter((c) => !used.includes(c.id!) || c.id === editingCategoryId)
	})

	form = this.fb.nonNullable.group({
		categoryId: ['', [Validators.required]],
		allocatedAmount: [
			null as number | null,
			[Validators.required, Validators.min(0.01)],
		],
	})

	constructor() {
		this.categoriesService.loadCategories().subscribe()

		if (this.zData?.envelopeId) {
			this.form.patchValue({
				categoryId: this.zData.categoryId ?? '',
				allocatedAmount: this.zData.allocatedAmount ?? null,
			})
			this.form.controls.categoryId.disable()
		}
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()

		if (this.zData.envelopeId) {
			this.budgetsService
				.updateEnvelope(this.zData.budgetId, this.zData.envelopeId, {
					allocatedAmount: Number(formValue.allocatedAmount),
				})
				.subscribe({
					next: () => {
						toast.success('Envelope updated successfully')
						this.dialogRef.close()
					},
					error: (err) => {
						toast.error(err.error?.message || 'Failed to update envelope')
					},
				})
		} else {
			this.budgetsService
				.addEnvelope(this.zData.budgetId, {
					categoryId: formValue.categoryId,
					allocatedAmount: Number(formValue.allocatedAmount),
				})
				.subscribe({
					next: () => {
						toast.success('Envelope added successfully')
						this.dialogRef.close()
					},
					error: (err) => {
						toast.error(err.error?.message || 'Failed to add envelope')
					},
				})
		}
	}
}
