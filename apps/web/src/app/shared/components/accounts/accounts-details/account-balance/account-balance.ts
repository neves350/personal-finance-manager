import { Component, computed, input } from '@angular/core'
import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import {
	CoinsIcon,
	CreditCardIcon,
	HandCoinsIcon,
	LandmarkIcon,
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletMinimalIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'

@Component({
	selector: 'app-account-balance',
	imports: [ZardCardComponent, LucideAngularModule, ZardDividerComponent],
	templateUrl: './account-balance.html',
})
export class AccountBalance {
	readonly WalletMinimalIcon = WalletMinimalIcon
	readonly LandmarkIcon = LandmarkIcon
	readonly HandCoinsIcon = HandCoinsIcon
	readonly CoinsIcon = CoinsIcon

	readonly account = input.required<BankAccount>()

	readonly bankAccountIcon = computed(() => {
		const iconMap: Record<BankType, typeof CreditCardIcon> = {
			[BankType.WALLET]: this.WalletMinimalIcon,
			[BankType.CHECKING]: this.LandmarkIcon,
			[BankType.SAVINGS]: this.HandCoinsIcon,
			[BankType.INVESTMENT]: this.CoinsIcon,
		}
		return iconMap[this.account().type]
	})

	readonly trendIcon = computed(() => {
		const balance = Number(this.account().balance)
		return balance < 0 ? TrendingDownIcon : TrendingUpIcon
	})

	readonly balanceColorClass = computed(() => {
		const balance = Number(this.account().balance)
		if (balance < 0) return 'text-destructive'
		if (balance === 0) return 'text-muted-foreground'
		return 'text-primary'
	})

	readonly balanceBgColorClass = computed(() => {
		const balance = Number(this.account().balance)
		if (balance < 0) return 'bg-destructive/20'
		if (balance === 0) return 'bg-muted'
		return 'bg-primary/20'
	})

	readonly formattedBalance = computed(() => {
		const { balance } = this.account()
		if (balance === null || balance === undefined) return null

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'EUR',
			signDisplay: 'always',
		}).format(Number(balance))
	})

	readonly formattedInitialBalance = computed(() => {
		const { initialBalance } = this.account()
		if (initialBalance === null || initialBalance === undefined) return null

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'EUR',
			signDisplay: 'always',
		}).format(Number(initialBalance))
	})

	readonly totalMovements = computed(() => {
		return this.account().totalMovements ?? 0
	})
}
