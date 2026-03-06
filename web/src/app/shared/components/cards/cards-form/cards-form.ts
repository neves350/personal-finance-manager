import {
	type AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
	FormBuilder,
	FormsModule,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms'
import { CardColor, CardType } from '@core/api/cards.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import { CardsColorPicker } from '../cards-color-picker/cards-color-picker'
import { CardsPreview } from '../cards-preview/cards-preview'
import type { iSheetData } from './cards-form.interface'

@Component({
	selector: 'app-cards-form',
	imports: [
		FormsModule,
		ReactiveFormsModule,
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		CardsColorPicker,
		CardsPreview,
	],
	templateUrl: './cards-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsForm implements AfterViewInit {
	private readonly zData: iSheetData = inject(Z_MODAL_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly cardsService = inject(CardsService)
	private readonly dialogRef = inject(ZardDialogRef)

	// Bank accounts from service (pre-loaded in Cards page)
	readonly bankAccounts = inject(BankAccountsService).bankAccounts

	// Form with default values
	form = this.fb.nonNullable.group({
		name: ['', [Validators.required]],
		color: [CardColor.GRAY, [Validators.required]],
		type: [CardType.CREDIT_CARD, [Validators.required]],
		lastFour: [''],
		creditLimit: [0 as number | null],
		closingDay: ['1'],
		dueDay: ['10'],
		bankAccountId: ['', [Validators.required]],
		expirationDate: [
			'',
			[Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)],
		],
		cvc: [
			'',
			[Validators.required, Validators.minLength(3), Validators.maxLength(4)],
		],
	})

	readonly isEditMode = computed(() => !!this.zData?.id)

	// Enum values for template
	readonly cardTypes = Object.values(CardType)
	readonly colors = Object.values(CardColor)
	readonly days = Array.from({ length: 31 }, (_, i) => i + 1)

	// Form values as signal for reactive preview
	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	// Preview data computed from form values
	readonly previewData = computed(() => ({
		name: this.formValues()?.name || 'Card Name',
		color: this.formValues()?.color || CardColor.GRAY,
		type: this.formValues()?.type || CardType.CREDIT_CARD,
		lastFour: this.formValues()?.lastFour || '',
		creditLimit: this.formValues()?.creditLimit ?? 0,
		closingDay: this.formValues()?.closingDay
			? Number(this.formValues()?.closingDay)
			: undefined,
		dueDay: this.formValues()?.dueDay
			? Number(this.formValues()?.dueDay)
			: undefined,
		expirationDate: this.formValues()?.expirationDate || '',
		cvc: this.formValues()?.cvc || '',
	}))

	// Type labels for display
	readonly typeLabels: Record<CardType, string> = {
		[CardType.CREDIT_CARD]: 'Credit Card',
		[CardType.DEBIT_CARD]: 'Debit Card',
	}

	ngAfterViewInit(): void {
		if (this.zData) {
			this.form.patchValue({
				...this.zData,
				closingDay: this.zData.closingDay?.toString() ?? '',
				dueDay: this.zData.dueDay?.toString() ?? '',
				bankAccountId: this.zData.accountId ?? '',
			})
		}
	}

	getTypeLabel(type: CardType): string {
		return this.typeLabels[type]
	}

	formatExpiry(event: Event): void {
		const input = event.target as HTMLInputElement
		let value = input.value.replace(/\D/g, '')
		if (value.length >= 2) {
			value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
		}
		input.value = value
		this.form.controls.expirationDate.setValue(value)
	}

	submit(onSuccess?: () => void): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = {
			name: formValue.name,
			color: formValue.color,
			type: formValue.type,
			bankAccountId: formValue.bankAccountId,
			lastFour: formValue.lastFour || undefined,
			creditLimit: formValue.creditLimit
				? Number(formValue.creditLimit)
				: undefined,
			closingDay: formValue.closingDay
				? Number(formValue.closingDay)
				: undefined,
			dueDay: formValue.dueDay ? Number(formValue.dueDay) : undefined,
			expirationDate: formValue.expirationDate || undefined,
			cvc: formValue.cvc || undefined,
		}

		const request$ = this.zData?.id
			? this.cardsService.update(this.zData.id, payload)
			: this.cardsService.create(payload)

		request$.subscribe({
			next: () => {
				onSuccess?.()
				this.dialogRef.close()
			},
		})
	}
}
