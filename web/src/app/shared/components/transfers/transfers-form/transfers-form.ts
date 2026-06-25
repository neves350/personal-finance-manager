import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import type { BankAccount } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { TransfersService } from '@core/services/transfers.service'
import {
	CircleArrowDownIcon,
	EuroIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import { ZardSheetRef } from '../../ui/sheet'

@Component({
	selector: 'app-transfers-form',
	imports: [
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		ReactiveFormsModule,
		ZardDatePickerComponent,
		LucideAngularModule,
	],
	templateUrl: './transfers-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersForm {
	private readonly transfersService = inject(TransfersService)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly fb = inject(FormBuilder)
	private readonly sheetRef = inject(ZardSheetRef)

	readonly selectedDate: Date | null = new Date()

	readonly CircleArrowDownIcon = CircleArrowDownIcon
	readonly EuroIcon = EuroIcon

	readonly accounts = computed(() =>
		this.bankAccountsService.bankAccounts().filter((a) => !a.isLinked),
	)

	form = this.fb.nonNullable.group({
		amount: [0 as number | null, [Validators.required, Validators.min(0.01)]],
		fromAccountId: ['', [Validators.required]],
		toAccountId: ['', [Validators.required]],
		date: [new Date().toISOString(), [Validators.required]],
		description: [''],
	})

	constructor() {
		// load accounts if they are not loaded yet
		if (!this.bankAccountsService.hasBankAccounts()) {
			this.bankAccountsService.loadBankAccounts().subscribe()
		}
	}

	onDateChange(date: Date | null) {
		// converts Date to string when receive the picker
		this.form.controls.date.setValue(date ? date.toISOString() : '')
	}

	formatBalance(account: BankAccount): number {
		return Number(account.balance)
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = {
			amount: Number(formValue.amount) || 0,
			fromAccountId: formValue.fromAccountId,
			toAccountId: formValue.toAccountId,
			date: new Date(formValue.date),
			description: formValue.description,
		}

		this.transfersService.create(payload).subscribe({
			next: () => {
				toast.success('Transfer created successfully')
				this.bankAccountsService.loadBankAccounts().subscribe()
				this.sheetRef.close()
			},
			error: (error) => {
				console.log('Full error:', error)
				console.log('Error message:', error.error?.message)
				toast.error(
					error.error?.message || error.message || 'Failed to create transfer',
				)
			},
		})
	}
}
