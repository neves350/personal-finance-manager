import { CurrencyPipe, DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { TransactionsService } from '@core/services/transactions.service'
import { TransfersService } from '@core/services/transfers.service'
import {
	ArrowDownIcon,
	ArrowRightLeftIcon,
	ArrowUpIcon,
	ChevronRightIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { Movement, MovementType } from '@/interfaces/movements.interface'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-dashboard-transactions',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardButtonComponent,
		RouterLink,
		DatePipe,
		CurrencyPipe,
	],
	templateUrl: './dashboard-transactions.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTransactions {
	private readonly transfersService = inject(TransfersService)
	private readonly transactionsService = inject(TransactionsService)

	readonly hasTransfers = this.transfersService.hasTransfers
	readonly hasTransactions = this.transactionsService.hasTransactions
	readonly loading = this.transfersService.loading

	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly ChevronRightIcon = ChevronRightIcon

	readonly iconMap = {
		transfer: {
			icon: ArrowRightLeftIcon,
			bg: 'bg-transfer text-transfer-foreground',
			amountClass: 'text-transfer',
		},
		income: {
			icon: ArrowUpIcon,
			bg: 'bg-income text-income-foreground',
			amountClass: 'text-income-foreground',
		},
		expense: {
			icon: ArrowDownIcon,
			bg: 'bg-expense text-expense-foreground',
			amountClass: 'text-expense-foreground',
		},
	}

	readonly recentMovements = computed((): Movement[] => {
		const transfers: Movement[] = this.transfersService
			.transfers()
			.map((t) => ({
				id: t.id ?? '',
				type: 'transfer' as MovementType,
				label: t.description || 'Transfer',
				subtitle: `${t.fromAccount?.name} → ${t.toAccount?.name}`,
				amount: -Number(t.amount),
				date: new Date(t.date),
			}))

		const transactions: Movement[] = this.transactionsService
			.transactions()
			.map((t) => ({
				id: t.id ?? '',
				type:
					t.type === 'INCOME'
						? ('income' as MovementType)
						: ('expense' as MovementType),
				label: t.title,
				subtitle: t.category?.title ?? '',
				amount: t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount),
				date: new Date(t.date),
			}))

		return [...transfers, ...transactions]
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, 5)
	})

	constructor() {
		this.transfersService.loadTransfers().subscribe()
		this.transactionsService.loadTransactions().subscribe()
	}
}
