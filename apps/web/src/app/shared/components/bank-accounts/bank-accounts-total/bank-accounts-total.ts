import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import {
	CircleArrowDownIcon,
	CircleArrowUpIcon,
	LucideAngularModule,
	WalletMinimalIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '../../ui/card'
import { ZardDividerComponent } from '../../ui/divider'

@Component({
	selector: 'app-bank-accounts-total',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardDividerComponent,
		CurrencyPipe,
	],
	templateUrl: './bank-accounts-total.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAccountsTotal {
	readonly WalletMinimalIcon = WalletMinimalIcon

	private readonly bankAccountsService = inject(BankAccountsService)

	readonly totalBalance = this.bankAccountsService.totalBalance
	readonly accountCount = this.bankAccountsService.totalAccounts
	readonly isNegative = computed(() => this.totalBalance() < 0)
	readonly negativeAccountCount = computed(
		() =>
			this.bankAccountsService.bankAccounts().filter((a) => a.balance < 0)
				.length,
	)

	readonly totalStyle = computed(() => {
		return this.isNegative()
			? {
					iconBg: 'bg-destructive/20',
					iconText: 'text-destructive',
					balance: 'text-destructive',
					trendIcon: CircleArrowDownIcon,
					trendText: 'text-destructive',
				}
			: {
					iconBg: 'bg-primary/20',
					iconText: 'text-primary',
					balance: 'text-primary',
					trendIcon: CircleArrowUpIcon,
					trendText: 'text-primary',
				}
	})
}
