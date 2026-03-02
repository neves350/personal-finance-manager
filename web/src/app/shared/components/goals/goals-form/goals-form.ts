import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { GoalType } from '@core/api/goals.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { GoalsService } from '@core/services/goals.service'
import {
	BanknoteArrowDownIcon,
	EuroIcon,
	HandCoinsIcon,
	LucideAngularModule,
	type LucideIconData,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import type { iGoalsData } from './goals-form.interface'

@Component({
	selector: 'app-goals-form',
	imports: [
		ZardDividerComponent,
		ReactiveFormsModule,
		ZardDatePickerComponent,
		LucideAngularModule,
		ZardSelectComponent,
		ZardSelectItemComponent,
	],
	templateUrl: './goals-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalsForm {
	private readonly zData: iGoalsData = inject(Z_MODAL_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly goalsService = inject(GoalsService)
	private readonly dialogRef = inject(ZardDialogRef)

	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly categoriesService = inject(CategoriesService)

	readonly accounts = this.bankAccountsService.bankAccounts
	readonly categories = this.categoriesService.expenseCategories

	readonly selectedDate: Date | null = new Date()
	readonly isEditMode = computed(() => !!this.zData?.id)

	readonly EuroIcon = EuroIcon

	// Form with default values
	form = this.fb.nonNullable.group({
		title: ['', [Validators.required]],
		amount: [0 as number | null, [Validators.required, Validators.min(0.01)]],
		type: [GoalType.SAVINGS, [Validators.required]],
		startDate: ['', [Validators.required]],
		endDate: [''],
		bankAccountId: [''],
		categoryId: [''],
	})

	constructor() {
		// Ensure data is loaded for the select dropdowns
		this.bankAccountsService.loadBankAccounts().subscribe()
		this.categoriesService.loadCategories().subscribe()

		// Initialize startDate with the default selectedDate
		if (this.selectedDate) {
			this.form.controls.startDate.setValue(this.selectedDate.toISOString())
		}

		// Populate form when editing
		if (this.zData?.id) {
			this.form.patchValue({
				title: this.zData.title ?? '',
				amount: this.zData.amount ?? 0,
				type: this.zData.type ?? GoalType.SAVINGS,
				startDate: this.zData.startDate ?? '',
				endDate: this.zData.endDate ?? '',
			})
		}
	}

	readonly goalTypes = Object.values(GoalType)

	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	// Preview data computed from form values
	readonly previewData = computed(() => ({
		title: this.formValues()?.title || 'E.g: Holidays, Gifts...',
		amount: this.formValues()?.amount ?? 0,
		type: this.formValues()?.type || GoalType.SAVINGS,
		startDate: this.formValues()?.startDate || '',
		endDate: this.formValues()?.endDate || '',
	}))

	readonly typeLabels: Record<GoalType, string> = {
		[GoalType.SAVINGS]: 'Savings',
		[GoalType.SPENDING_LIMIT]: 'Spending Limit',
	}

	getTypeLabel(type: GoalType): string {
		return this.typeLabels[type]
	}

	readonly typeIcons: Record<GoalType, LucideIconData> = {
		[GoalType.SAVINGS]: HandCoinsIcon,
		[GoalType.SPENDING_LIMIT]: BanknoteArrowDownIcon,
	}

	readonly typeDescriptions: Record<GoalType, string> = {
		[GoalType.SAVINGS]: 'Save money',
		[GoalType.SPENDING_LIMIT]: 'Control expenses',
	}

	selectType(type: GoalType): void {
		this.form.controls.type.setValue(type)
	}

	getTypeClasses(goalType: GoalType): string {
		const isSelected = this.form.controls.type.value === goalType

		if (!isSelected) return 'border-zinc-700'

		return goalType === GoalType.SAVINGS
			? 'border-primary bg-primary/10'
			: 'border-destructive bg-destructive/10'
	}

	getTypeIconClasses(goalType: GoalType): string {
		const isSelected = this.form.controls.type.value === goalType

		if (!isSelected) return 'text-muted-foreground'

		return goalType === GoalType.SAVINGS ? 'text-primary' : 'text-destructive'
	}

	onStartDateChange(date: Date | null) {
		// converts Date to string when receive the picker
		this.form.controls.startDate.setValue(date ? date.toISOString() : '')
	}

	onEndDateChange(date: Date | null) {
		this.form.controls.endDate.setValue(date ? date.toISOString() : '')
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = {
			title: formValue.title,
			amount: Number(formValue.amount) || 0,
			type: formValue.type,
			startDate: formValue.startDate,
			...(formValue.bankAccountId && {
				bankAccountId: formValue.bankAccountId,
			}),
			...(formValue.categoryId && { categoryId: formValue.categoryId }),
			...(formValue.endDate && { endDate: formValue.endDate }),
		}

		const request$ = this.zData?.id
			? this.goalsService.update(this.zData.id, payload)
			: this.goalsService.create(payload)

		request$.subscribe({
			next: () => {
				toast.success(
					this.zData?.id
						? 'Goal updated successfully'
						: 'Goal created successfully',
				)
				this.bankAccountsService.loadBankAccounts().subscribe()
				this.dialogRef.close()
			},
			error: (error) => {
				toast.error(
					error.error?.message || error.message || 'Failed to save goal',
				)
			},
		})
	}
}
