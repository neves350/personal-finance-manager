import {
	ChangeDetectionStrategy,
	Component,
	inject,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import type { BankAccount } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { TransfersService } from '@core/services/transfers.service'
import { ArrowDownIcon, EuroIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardDatePickerComponent } from '../../ui/date-picker'
import { ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'

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
	private readonly dialogRef = inject(ZardDialogRef)

	readonly selectedDate: Date | null = new Date()

	readonly ArrowDownIcon = ArrowDownIcon
	readonly EuroIcon = EuroIcon

	// list all accounts
	readonly accounts = this.bankAccountsService.bankAccounts

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

	formatBalance(account: BankAccount): string {
		return new Intl.NumberFormat('pt-PT', {
			style: 'currency',
			currency: account.currency,
		}).format(Number(account.balance))
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
				this.dialogRef.close()
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
