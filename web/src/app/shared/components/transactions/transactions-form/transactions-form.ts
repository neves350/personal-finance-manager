import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import {
	type CreateTransactionRequest,
	TransactionType,
} from '@core/api/transactions.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { CategoriesService } from '@core/services/categories.service'
import { TransactionsService } from '@core/services/transactions.service'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	EuroIcon,
	LandmarkIcon,
	LucideAngularModule,
	type LucideIconData,
} from 'lucide-angular'
import { ZardCheckboxComponent } from '../../ui/checkbox'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import type { iTransactionData } from './transactions-form.interface'

@Component({
	selector: 'app-transactions-form',
	imports: [
		ZardDividerComponent,
		ReactiveFormsModule,
		ZardSelectComponent,
		ZardSelectItemComponent,
		ZardDatePickerComponent,
		LucideAngularModule,
		ZardCheckboxComponent,
	],
	templateUrl: './transactions-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsForm {
	private readonly zData: iTransactionData = inject(Z_SHEET_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly sheetRef = inject(ZardSheetRef)
	private readonly transactionsService = inject(TransactionsService)
	private readonly cardsService = inject(CardsService)
	private readonly categoriesService = inject(CategoriesService)
	private readonly bankAccountsService = inject(BankAccountsService)

	readonly categories = this.categoriesService.expenseCategories
	readonly cards = this.cardsService.cards
	readonly accounts = this.bankAccountsService.bankAccounts

	readonly transactionTypes = Object.values(TransactionType)
	readonly isEditMode = computed(() => !!this.zData?.id)
	readonly isOpenBanking = computed(() => this.zData?.source === 'OPEN_BANKING')
	readonly initialDate = computed(() =>
		this.zData?.date ? new Date(this.zData.date) : new Date(),
	)

	readonly ArrowDownIcon = ArrowDownIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly EuroIcon = EuroIcon
	readonly LandmarkIcon = LandmarkIcon

	form = this.fb.nonNullable.group({
		title: ['', [Validators.required]],
		type: [TransactionType.EXPENSE, [Validators.required]],
		amount: [0 as number | null, [Validators.required, Validators.min(0.01)]],
		date: [new Date().toISOString(), [Validators.required]],
		bankAccountId: ['', [Validators.required]],
		cardId: [''],
		categoryId: ['', [Validators.required]],
		isPaid: [false],
	})

	private readonly selectedType = toSignal(
		this.form.controls.type.valueChanges,
		{ initialValue: this.form.controls.type.value },
	)
	readonly filteredCategories = computed(() => {
		const type = this.isOpenBanking()
			? (this.zData?.type as TransactionType ?? TransactionType.EXPENSE)
			: this.selectedType()
		return type === TransactionType.INCOME
			? this.categoriesService.incomeCategories()
			: this.categoriesService.expenseCategories()
	})

	constructor() {
		if (!this.cardsService.hasCards()) {
			this.cardsService.loadCards().subscribe()
		}
		if (!this.categoriesService.hasCategories()) {
			this.categoriesService.loadCategories().subscribe()
		}
		if (!this.bankAccountsService.bankAccounts().length) {
			this.bankAccountsService.loadBankAccounts().subscribe()
		}

		if (this.zData) {
			this.form.patchValue({
				title: this.zData.title ?? '',
				type: this.zData.type ?? TransactionType.EXPENSE,
				amount: this.zData.amount ?? 0,
				date: this.zData.date
					? new Date(this.zData.date).toISOString().split('T')[0]
					: '',
				bankAccountId: this.zData.bankAccountId ?? '',
				cardId: this.zData.cardId ?? '',
				categoryId: this.zData.categoryId ?? '',
				isPaid: this.zData.isPaid ?? false,
			})

			// Lock fields for Open Banking transactions (title and category editable)
			if (this.zData.source === 'OPEN_BANKING') {
				this.form.controls.amount.disable()
				this.form.controls.date.disable()
				this.form.controls.type.disable()
				this.form.controls.bankAccountId.disable()
				this.form.controls.cardId.disable()
				this.form.controls.isPaid.disable()
			}
		}
	}

	readonly typeLabels: Record<TransactionType, string> = {
		[TransactionType.EXPENSE]: 'Expenses',
		[TransactionType.INCOME]: 'Income',
	}

	getTypeLabel(type: TransactionType): string {
		return this.typeLabels[type]
	}

	readonly typeIcons: Record<TransactionType, LucideIconData> = {
		[TransactionType.EXPENSE]: this.ArrowDownIcon,
		[TransactionType.INCOME]: this.ArrowUpIcon,
	}

	readonly typeDescriptions: Record<TransactionType, string> = {
		[TransactionType.EXPENSE]: 'Expenses',
		[TransactionType.INCOME]: 'Income',
	}

	selectType(type: TransactionType): void {
		this.form.controls.type.setValue(type)
	}

	getTypeClasses(transactionType: TransactionType): string {
		const isSelected = this.form.controls.type.value === transactionType

		if (!isSelected) return 'border-input'

		return transactionType === TransactionType.INCOME
			? 'border-primary bg-primary/20'
			: 'border-destructive bg-destructive/20'
	}

	getTypeIconClasses(transactionType: TransactionType): string {
		const isSelected = this.form.controls.type.value === transactionType

		if (!isSelected) return 'text-foreground'

		return transactionType === TransactionType.INCOME
			? 'text-primary'
			: 'text-destructive'
	}

	onDateChange(date: Date | null) {
		this.form.controls.date.setValue(date ? date.toISOString() : '')
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = this.isOpenBanking()
			? {
					title: formValue.title,
					categoryId: formValue.categoryId,
				}
			: {
					title: formValue.title,
					type: formValue.type,
					amount: Number(formValue.amount) || 0,
					date: new Date(formValue.date),
					bankAccountId: formValue.bankAccountId,
					categoryId: formValue.categoryId,
					...(formValue.cardId && { cardId: formValue.cardId }),
					isPaid: formValue.isPaid,
				}

		const request$ = this.zData?.id
			? this.transactionsService.update(this.zData.id, payload)
			: this.transactionsService.create(payload as CreateTransactionRequest)

		request$.subscribe({
			next: () => this.sheetRef.close(),
		})
	}
}
