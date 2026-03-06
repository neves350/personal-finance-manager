import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { AuthService } from '@core/services/auth/auth.service'
import {
	ArrowRightLeftIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { BankAccountsForm } from '../../bank-accounts/bank-accounts-form/bank-accounts-form'
import { TransfersForm } from '../../transfers/transfers-form/transfers-form'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'

@Component({
	selector: 'app-dashboard-header',
	imports: [ZardButtonComponent, LucideAngularModule],
	templateUrl: './dashboard-header.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader {
	private readonly dialogService = inject(ZardDialogService)
	private readonly authService = inject(AuthService)

	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly PlusIcon = PlusIcon
	readonly user = this.authService.currentUser

	openTransfer() {
		this.dialogService.create({
			zTitle: 'New Transfer',
			zContent: TransfersForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Send Transfer',
			zOnOk: (instance: TransfersForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	openSheet() {
		this.dialogService.create({
			zTitle: 'New Account',
			zContent: BankAccountsForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Create Account',
			zOnOk: (instance: BankAccountsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	get greeting(): string {
		const hour = new Date().getHours()

		if (hour < 12) return 'Good morning'
		if (hour < 18) return 'Good afternoon'
		return 'Good evening'
	}
}
