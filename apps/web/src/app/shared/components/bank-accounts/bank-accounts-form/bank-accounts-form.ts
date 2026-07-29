import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { BankType } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { EuroIcon, LucideAngularModule } from 'lucide-angular'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'
import type { iSheetData } from './bank-account-form.interface'

@Component({
	selector: 'app-bank-accounts-form',
	imports: [
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		ReactiveFormsModule,
		LucideAngularModule,
	],
	templateUrl: './bank-accounts-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAccountsForm {
	private readonly zData: iSheetData = inject(Z_MODAL_DATA)
	private readonly fb = inject(FormBuilder)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly dialogRef = inject(ZardDialogRef)

	readonly EuroIcon = EuroIcon

	// Form with default values
	form = this.fb.nonNullable.group({
		name: ['', [Validators.required]],
		type: [BankType.CHECKING, [Validators.required]],
		balance: [0 as number | null],
	})

	constructor() {
		// Populate form when editing
		if (this.zData?.id) {
			this.form.patchValue({
				name: this.zData.name ?? '',
				type: this.zData.type ?? BankType.CHECKING,
				balance: this.zData.balance ?? 0,
			})
		}
	}

	readonly isEditMode = computed(() => !!this.zData?.id)

	// Enum values for template
	readonly bankAccountTypes = Object.values(BankType)

	// Form values as signal for reactive preview
	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	// Preview data computed from form values
	readonly previewData = computed(() => ({
		name: this.formValues()?.name || 'Account Name',
		type: this.formValues()?.type || BankType.CHECKING,
		balance: this.formValues()?.balance ?? 0,
	}))

	// Type labels for display
	readonly typeLabels: Record<BankType, string> = {
		[BankType.WALLET]: 'Wallet',
		[BankType.CHECKING]: 'Checking',
		[BankType.SAVINGS]: 'Savings',
		[BankType.INVESTMENT]: 'Investment',
	}

	getTypeLabel(type: BankType): string {
		return this.typeLabels[type]
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = {
			name: formValue.name,
			type: formValue.type,
			balance: Number(formValue.balance) || 0,
		}

		const request$ = this.zData?.id
			? this.bankAccountsService.update(this.zData.id, payload)
			: this.bankAccountsService.create(payload)

		request$.subscribe({
			next: () => this.dialogRef.close(),
		})
	}
}
