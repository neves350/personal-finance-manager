import { DatePipe } from '@angular/common'
import {
	afterNextRender,
	Component,
	computed,
	inject,
	input,
	signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { BankAccountsApi } from '@core/api/bank-accounts.api'
import type { BankAccount, Movement } from '@core/api/bank-accounts.interface'
import {
	ArrowRightIcon,
	ArrowRightLeftIcon,
	BanknoteXIcon,
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-account-recent',
	imports: [
		ZardCardComponent,
		ZardButtonComponent,
		LucideAngularModule,
		RouterLink,
		DatePipe,
	],
	templateUrl: './account-recent.html',
})
export class AccountRecent {
	readonly ArrowRightIcon = ArrowRightIcon
	readonly BanknoteXIcon = BanknoteXIcon
	readonly TrendingUpIcon = TrendingUpIcon
	readonly TrendingDownIcon = TrendingDownIcon
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon

	readonly account = input.required<BankAccount>()
	readonly movements = signal<Movement[]>([])
	readonly loading = signal(true)

	private readonly bankAccountsApi = inject(BankAccountsApi)

	readonly hasMovements = computed(() => this.movements().length > 0)

	constructor() {
		afterNextRender(() => {
			this.fetchMovements()
		})
	}

	private fetchMovements(): void {
		const accountId = this.account().id
		if (!accountId) return

		this.bankAccountsApi.getRecentMovements(accountId).subscribe({
			next: (res) => {
				this.movements.set(res.data)
				this.loading.set(false)
			},
			error: () => {
				this.loading.set(false)
			},
		})
	}

	getMovementIcon(movement: Movement) {
		if (movement.type === 'transfer') return this.ArrowRightLeftIcon
		return movement.transactionType === 'INCOME'
			? this.TrendingUpIcon
			: this.TrendingDownIcon
	}

	getMovementColorClass(movement: Movement): string {
		if (movement.type === 'transfer')
			return 'bg-transfer text-transfer-foreground'
		return movement.transactionType === 'INCOME'
			? 'bg-income text-income-foreground'
			: 'bg-expense text-expense-foreground'
	}

	getAmountColorClass(movement: Movement): string {
		if (movement.type === 'transfer') return 'text-transfer'
		return movement.transactionType === 'INCOME'
			? 'text-income'
			: 'text-expense'
	}

	getAmountPrefix(movement: Movement): string {
		if (movement.type === 'transfer') {
			const isOutgoing = movement.fromAccount?.id === this.account().id
			return isOutgoing ? '-' : '+'
		}
		return movement.transactionType === 'INCOME' ? '+' : '-'
	}

	formatAmount(amount: number): string {
		return `€${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
	}
}
