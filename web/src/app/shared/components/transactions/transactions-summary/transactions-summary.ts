import { CurrencyPipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { TransactionsService } from '@core/services/transactions.service'
import {
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-transactions-summary',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './transactions-summary.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsSummary {
	private readonly transactionsService = inject(TransactionsService)

	readonly monthSummary = this.transactionsService.monthSummary
	readonly absBalance = computed(() => Math.abs(this.monthSummary().balance))

	readonly TrendingUpIcon = TrendingUpIcon
	readonly TrendingDownIcon = TrendingDownIcon
	readonly WalletIcon = WalletIcon

	balanceSign(value: number): string {
		if (value > 0) return '+'
		if (value < 0) return '-'
		return ''
	}
}
