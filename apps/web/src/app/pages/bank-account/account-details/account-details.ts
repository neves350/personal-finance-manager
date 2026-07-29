import { Component, DestroyRef, effect, inject, input } from '@angular/core'
import { BankAccount } from '@core/api/bank-accounts.interface'
import { AccountBalance } from '@/shared/components/accounts/accounts-details/account-balance/account-balance'
import { AccountBalanceChart } from '@/shared/components/accounts/accounts-details/account-balance-chart/account-balance-chart'
import { AccountHeader } from '@/shared/components/accounts/accounts-details/account-header/account-header'
import { AccountRecent } from '@/shared/components/accounts/accounts-details/account-recent/account-recent'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'

@Component({
	selector: 'app-account-details',
	imports: [AccountHeader, AccountBalance, AccountBalanceChart, AccountRecent],
	templateUrl: './account-details.html',
})
export class AccountDetails {
	readonly account = input.required<BankAccount>()

	private readonly service = inject(BreadcrumbService)
	private readonly destroyRef = inject(DestroyRef)

	constructor() {
		effect(() => this.service.set(this.account().name))
		this.destroyRef.onDestroy(() => this.service.clear())
	}
}
