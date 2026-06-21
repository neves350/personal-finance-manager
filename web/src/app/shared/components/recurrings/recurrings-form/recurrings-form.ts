import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import {
	FrequencyType,
	PaymentMethodType,
	RecurringType,
} from '@core/api/recurrings.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { CategoriesService } from '@core/services/categories.service'
import { RecurringsService } from '@core/services/recurrings.service'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CoinsIcon,
	EuroIcon,
	LucideAngularModule,
	type LucideIconData,
	WalletIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import type { iRecurringSheetData } from './recurrings-form.interface'

@Component({
	selector: 'app-recurrings-form',
	imports: [
		ReactiveFormsModule,
		LucideAngularModule,
		ZardDatePickerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		ZardDividerComponent,
	],
	templateUrl: './recurrings-form.html',
})
export class RecurringsForm {
	private readonly recurringsService = inject(RecurringsService)
	private readonly cardsService = inject(CardsService)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly categoriesService = inject(CategoriesService)
	private readonly zData: iRecurringSheetData = inject(Z_SHEET_DATA)
	private readonly sheetRef = inject(ZardSheetRef)
	private readonly fb = inject(FormBuilder)

	readonly isEditMode = computed(() => !!this.zData?.id)

	readonly accounts = this.bankAccountsService.bankAccounts
	readonly cards = this.cardsService.cards
	readonly selectedDate: Date | null = new Date()
	readonly days = Array.from({ length: 31 }, (_, i) => i + 1)
	readonly recurringTypes = Object.values(RecurringType)
	readonly frequencyTypes = Object.values(FrequencyType)
	readonly paymentMethodTypes = Object.values(PaymentMethodType)

	readonly EuroIcon = EuroIcon

	form = this.fb.nonNullable.group({
		type: [RecurringType.EXPENSE, [Validators.required]],
		description: ['', [Validators.required]],
		amount: [0 as number | null, [Validators.required, Validators.min(0.01)]],
		monthDay: ['1', [Validators.required]],
		frequency: [FrequencyType.MONTH, [Validators.required]],
		categoryId: ['', [Validators.required]],
		paymentMethod: [PaymentMethodType.MONEY, [Validators.required]],
		cardId: [''],
		bankAccountId: ['', [Validators.required]],
		startDate: ['', [Validators.required]],
		endDate: [''],
	})

	private readonly selectedType = toSignal(
		this.form.controls.type.valueChanges,
		{ initialValue: this.form.controls.type.value },
	)
	readonly filteredCategories = computed(() =>
		this.selectedType() === RecurringType.INCOME
			? this.categoriesService.incomeCategories()
			: this.categoriesService.expenseCategories(),
	)

	constructor() {
		this.categoriesService.loadCategories().subscribe()
		this.cardsService.loadCards().subscribe()
		this.bankAccountsService.loadBankAccounts().subscribe()

		// init startDate with default selectedDate
		if (this.selectedDate) {
			this.form.controls.startDate.setValue(this.selectedDate.toISOString())
		}

		if (this.zData?.id) {
			this.form.patchValue({
				type: this.zData.type ?? RecurringType.EXPENSE,
				description: this.zData.description ?? '',
				amount: this.zData.amount ?? 0,
				monthDay: this.zData.monthDay ? String(this.zData.monthDay) : '',
				frequency: this.zData.frequency ?? FrequencyType.MONTH,
				categoryId: this.zData.categoryId ?? '',
				paymentMethod: this.zData.paymentMethod ?? PaymentMethodType.MONEY,
				cardId: this.zData.cardId ?? '',
				bankAccountId: this.zData.bankAccountId ?? '',
				startDate: this.zData.startDate ?? '',
				endDate: this.zData.endDate ?? '',
			})
		}
	}

	readonly typeLabels: Record<RecurringType, string> = {
		[RecurringType.EXPENSE]: 'Expenses',
		[RecurringType.INCOME]: 'Income',
	}
	readonly typeIcons: Record<RecurringType, LucideIconData> = {
		[RecurringType.EXPENSE]: ArrowDownIcon,
		[RecurringType.INCOME]: ArrowUpIcon,
	}
	readonly typeFrequencies: Record<FrequencyType, string> = {
		[FrequencyType.MONTH]: 'Month',
		[FrequencyType.ANNUAL]: 'Annual',
	}
	readonly typePayments: Record<PaymentMethodType, string> = {
		[PaymentMethodType.MONEY]: 'Money',
		[PaymentMethodType.CARD]: 'Card',
	}
	readonly paymentIcons: Record<PaymentMethodType, LucideIconData> = {
		[PaymentMethodType.MONEY]: CoinsIcon,
		[PaymentMethodType.CARD]: WalletIcon,
	}

	getTypeLabel(type: RecurringType): string {
		return this.typeLabels[type]
	}

	selectType(type: RecurringType): void {
		this.form.controls.type.setValue(type)
	}

	getTypeClasses(recurringType: RecurringType): string {
		const isSelected = this.form.controls.type.value === recurringType

		if (!isSelected) return 'border-zinc-700'

		return recurringType === RecurringType.INCOME
			? 'border-primary bg-primary/20'
			: 'border-destructive bg-destructive/20'
	}

	getTypeIconClasses(recurringType: RecurringType): string {
		const isSelected = this.form.controls.type.value === recurringType

		if (!isSelected) return 'text-muted-foreground'

		return recurringType === RecurringType.INCOME
			? 'text-primary'
			: 'text-destructive'
	}

	getTypeFrequencies(type: FrequencyType): string {
		return this.typeFrequencies[type]
	}

	getTypePayments(type: PaymentMethodType): string {
		return this.typePayments[type]
	}

	getPaymentLabel(type: PaymentMethodType): string {
		return this.typePayments[type]
	}

	selectPayments(type: PaymentMethodType): void {
		this.form.controls.paymentMethod.setValue(type)
	}

	getPaymentsClasses(paymentType: PaymentMethodType): string {
		const isSelected = this.form.controls.paymentMethod.value === paymentType

		if (!isSelected) return 'border-zinc-700'

		return paymentType === PaymentMethodType.CARD
			? 'border-chart-2 bg-chart-2/10'
			: 'border-chart-4 bg-chart-4/10'
	}

	getPaymentsIconClasses(paymentType: PaymentMethodType): string {
		const isSelected = this.form.controls.paymentMethod.value === paymentType

		if (!isSelected) return 'text-muted-foreground'

		return paymentType === PaymentMethodType.CARD
			? 'text-chart-2'
			: 'text-chart-4'
	}

	onStartDateChange(date: Date | null) {
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
			type: formValue.type,
			description: formValue.description,
			amount: Number(formValue.amount) || 0,
			monthDay: Number(formValue.monthDay),
			frequency: formValue.frequency,
			categoryId: formValue.categoryId,
			paymentMethod: formValue.paymentMethod,
			...(formValue.cardId && { cardId: formValue.cardId }),
			bankAccountId: formValue.bankAccountId,
			startDate: new Date(formValue.startDate),
			...(formValue.endDate && { endDate: new Date(formValue.endDate) }),
		}

		const request$ = this.zData?.id
			? this.recurringsService.update(this.zData.id, payload)
			: this.recurringsService.create(payload)

		request$.subscribe({
			next: () => {
				toast.success(
					this.zData?.id
						? 'Recurring transaction updated successfully'
						: 'Recurring transaction created successfully',
				)
				this.sheetRef.close()
			},
			error: (error) => {
				toast.error(
					error.error?.message ||
						error.message ||
						'Failed to save recurring transaction',
				)
			},
		})
	}
}
