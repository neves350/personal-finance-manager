import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { BankAccount } from '@core/api/bank-accounts.interface'
import { BankAccountsCard } from '../bank-accounts-card/bank-accounts-card'

@Component({
	selector: 'app-bank-accounts-list',
	imports: [BankAccountsCard],
	templateUrl: './bank-accounts-list.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAccountsList {
	readonly accounts = input.required<BankAccount[]>()
}
