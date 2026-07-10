import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import {
	LandmarkIcon,
	LucideAngularModule,
	PlusIcon,
	ReceiptTextIcon,
	RepeatIcon,
} from 'lucide-angular'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDropdownImports } from '../../ui/dropdown'
import { ZardSheetService } from '../../ui/sheet'

@Component({
	selector: 'app-header-tools',
	imports: [ZardDropdownImports, LucideAngularModule],
	templateUrl: './header-tools.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderTools {
	private readonly sheetService = inject(ZardSheetService)
	private readonly dialogService = inject(ZardDialogService)

	readonly PlusIcon = PlusIcon
	readonly ReceiptTextIcon = ReceiptTextIcon
	readonly RepeatIcon = RepeatIcon
	readonly LandmarkIcon = LandmarkIcon

	async openTransactionForm() {
		const { TransactionsForm } = await import(
			'../../transactions/transactions-form/transactions-form'
		)

		this.sheetService.create({
			zTitle: 'New Transaction',
			zContent: TransactionsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create Transaction',
			zOnOk: (instance: InstanceType<typeof TransactionsForm>) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'sm:rounded-l-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	async openRecurringForm() {
		const { RecurringsForm } = await import(
			'../../recurrings/recurrings-form/recurrings-form'
		)

		this.sheetService.create({
			zTitle: 'New Recurring Transaction',
			zContent: RecurringsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create recurring',
			zOnOk: (instance: InstanceType<typeof RecurringsForm>) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'sm:rounded-l-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	async openAccountDialog() {
		const { AccountDialog } = await import(
			'../../accounts/account-dialog/account-dialog'
		)

		this.dialogService.create({
			zTitle: 'Add Account',
			zDescription: 'Choose how you want to add your account',
			zContent: AccountDialog,
			zWidth: '580px',
			zHideFooter: true,
			zCustomClasses:
				'sm:rounded-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zOnOk: () => {},
		})
	}
}
