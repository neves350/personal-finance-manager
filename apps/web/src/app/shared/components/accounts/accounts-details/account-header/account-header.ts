import { Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	ArrowLeftIcon,
	Link2OffIcon,
	LinkIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardBadgeComponent } from '@/shared/components/ui/badge'
import { ZardButtonComponent } from '@/shared/components/ui/button'

@Component({
	selector: 'app-account-header',
	imports: [
		ZardButtonComponent,
		ZardBadgeComponent,
		LucideAngularModule,
		RouterLink,
	],
	templateUrl: './account-header.html',
})
export class AccountHeader {
	readonly ArrowLeftIcon = ArrowLeftIcon
	readonly LinkIcon = LinkIcon
	readonly Link2OffIcon = Link2OffIcon

	private readonly openBankingService = inject(OpenBankingService)

	readonly account = input.required<BankAccount>()
	readonly isLinked = computed(() => !!this.account().isLinked)

	private readonly connectionFromService = computed(() =>
		this.openBankingService
			.connections()
			.find((c) =>
				c.accounts?.some((a) => a.bankAccountId === this.account().id),
			),
	)

	readonly isActive = computed(
		() => this.isLinked() && !!this.connectionFromService(),
	)
	readonly isDisconnected = computed(
		() => this.isLinked() && !this.connectionFromService(),
	)

	private readonly typeLabels: Record<BankType, string> = {
		[BankType.WALLET]: 'Wallet',
		[BankType.CHECKING]: 'Checking',
		[BankType.SAVINGS]: 'Savings',
		[BankType.INVESTMENT]: 'Investment',
	}

	readonly accountType = computed(() => {
		return this.typeLabels[this.account().type]
	})
}
