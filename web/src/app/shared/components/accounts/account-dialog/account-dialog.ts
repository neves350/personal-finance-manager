import {
	ChangeDetectionStrategy,
	Component,
	inject,
	output,
} from '@angular/core'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	CheckIcon,
	LandmarkIcon,
	LucideAngularModule,
	PencilIcon,
	SparklesIcon,
} from 'lucide-angular'
import { BankAccountsForm } from '../../bank-accounts/bank-accounts-form/bank-accounts-form'
import { ZardDialogRef, ZardDialogService } from '../../ui/dialog'

@Component({
	selector: 'app-account-dialog',
	imports: [LucideAngularModule],
	templateUrl: './account-dialog.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialog {
	readonly selectAutomatic = output<void>()
	readonly selectManual = output<void>()

	readonly LandmarkIcon = LandmarkIcon
	readonly PencilIcon = PencilIcon
	readonly SparklesIcon = SparklesIcon
	readonly CheckIcon = CheckIcon

	private readonly dialogRef = inject(ZardDialogRef)
	private readonly dialogService = inject(ZardDialogService)
	private readonly obService = inject(OpenBankingService)

	connectBank() {
		this.dialogRef.close()
		this.obService.connectBank('').subscribe({
			next: (url) => {
				window.location.href = url
			},
		})
	}

	openManual() {
		this.dialogRef.close()
		this.dialogService.create({
			zTitle: 'New Account',
			zContent: BankAccountsForm,
			zWidth: '450px',
			zHideFooter: false,
			zOkText: 'Create Account',
			zOnOk: (instance: BankAccountsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-3 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
