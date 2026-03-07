import { CurrencyPipe, DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { TransactionsService } from '@core/services/transactions.service'
import { TransfersService } from '@core/services/transfers.service'
import {
	ArrowDownIcon,
	ArrowRightIcon,
	ArrowRightLeftIcon,
	ArrowUpIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'

type FilterType = 'all' | 'income' | 'outcome'
interface Movement {
	id: string
	type: 'transfer' | 'income' | 'expense'
	label: string
	subtitle?: string
	category: string
	method: string
	amount: number
	currency: string
	date: Date
}

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

	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly ArrowUpIcon = ArrowUpIcon
	readonly ArrowDownIcon = ArrowDownIcon
	readonly ArrowRightIcon = ArrowRightIcon

	readonly activeFilter = signal<FilterType>('all')

	readonly iconMap = {
		transfer: {
			icon: ArrowRightLeftIcon,
			bg: 'bg-transfer text-transfer-foreground',
		},
		income: { icon: ArrowUpIcon, bg: 'bg-income text-income-foreground' },
		expense: { icon: ArrowDownIcon, bg: 'bg-expense text-expense-foreground' },
	}

	readonly recentMovements = computed((): Movement[] => {
		const transfers: Movement[] = this.transfersService
			.transfers()
			.map((t) => ({
				id: t.id ?? '',
				type: 'transfer',
				label: t.description || 'Transfer',
				subtitle: `${t.fromAccount?.name} → ${t.toAccount?.name}`,
				category: 'Transfer',
				method: t.fromAccount?.name ?? 'Bank Transfer',
				amount: -Number(t.amount),
				currency: t.fromAccount?.currency ?? 'EUR',
				date: new Date(t.date),
			}))

		const transactions: Movement[] = this.transactionsService
			.transactions()
			.map((t) => ({
				id: t.id ?? '',
				type: t.type === 'INCOME' ? 'income' : 'expense',
				label: t.title,
				category: t.category?.title ?? '',
				method: t.card?.name ?? t.bankAccount?.name ?? 'Account',
				amount: t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount),
				currency: 'EUR',
				date: new Date(t.date),
			}))

		return [...transfers, ...transactions]
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, 5)
	})

	readonly filteredMovements = computed(() => {
		const filter = this.activeFilter()
		const movements = this.recentMovements()
		if (filter === 'all') return movements
		if (filter === 'income') return movements.filter((m) => m.type === 'income')
		return movements.filter(
			(m) => m.type === 'expense' || m.type === 'transfer',
		)
	})

	readonly hasMovements = computed(() => this.recentMovements().length > 0)

	constructor() {
		this.transfersService.loadTransfers().subscribe()
		this.transactionsService.loadTransactions().subscribe()
	}

	setFilter(filter: FilterType): void {
		this.activeFilter.set(filter)
	}

	getAmountClass(type: string): string {
		return type === 'income'
			? 'text-income-foreground'
			: 'text-expense-foreground'
	}
}
