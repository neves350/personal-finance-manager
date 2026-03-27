import { Component, computed, inject, type OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	ArrowRightLeftIcon,
	BuildingIcon,
	CoinsIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { BankAccountsForm } from '@/shared/components/bank-accounts/bank-accounts-form/bank-accounts-form'
import { BankAccountsList } from '@/shared/components/bank-accounts/bank-accounts-list/bank-accounts-list'
import { BankAccountsTotal } from '@/shared/components/bank-accounts/bank-accounts-total/bank-accounts-total'
import { TransfersForm } from '@/shared/components/transfers/transfers-form/transfers-form'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import { ZardSheetService } from '@/shared/components/ui/sheet'

@Component({
	selector: 'app-bank-account',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		BankAccountsList,
		BankAccountsTotal,
		ZardLoaderComponent,
	],
	templateUrl: './bank-account.html',
})
export class BankAccount implements OnInit {
	readonly CoinsIcon = CoinsIcon
	readonly PlusIcon = PlusIcon
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly BuildingIcon = BuildingIcon

	private readonly route = inject(ActivatedRoute)
	private readonly dialogService = inject(ZardDialogService)
	private readonly sheetService = inject(ZardSheetService)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly openBankingService = inject(OpenBankingService)

	readonly accounts = this.bankAccountsService.bankAccounts
	readonly visibleAccounts = computed(() =>
		this.accounts().filter((a) => !a.isCardAccount),
	)
	readonly isLoading = this.bankAccountsService.loading
	readonly hasBankAccounts = computed(() => this.visibleAccounts().length > 0)

	readonly connectingProvider = signal<string | null>(null)
	readonly syncing = signal(false)

	ngOnInit(): void {
		this.openBankingService.loadConnections().subscribe()

		// Check if returning from Salt Edge callback
		const isCallback =
			this.route.snapshot.queryParamMap.get('callback') === 'success'

		if (isCallback) {
			this.syncing.set(true)
			this.openBankingService.handleCallback().subscribe({
				next: () => {
					toast.success('Bank connected successfully!')
					this.syncing.set(false)
					this.bankAccountsService.loadBankAccounts().subscribe()
				},
				error: () => {
					toast.error('Failed to sync bank connection')
					this.syncing.set(false)
					this.bankAccountsService.loadBankAccounts().subscribe()
				},
			})
		} else {
			this.bankAccountsService.loadBankAccounts().subscribe()
		}
	}

	openTransfer() {
		this.sheetService.create({
			zTitle: 'New Transfer',
			zContent: TransfersForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Send Transfer',
			zOnOk: (instance: TransfersForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
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

	connect(providerCode: string) {
		this.connectingProvider.set(providerCode)
		this.openBankingService.connectBank(providerCode).subscribe({
			next: (url) => {
				window.location.href = url
			},
			error: () => {
				this.connectingProvider.set(null)
			},
		})
	}
}
