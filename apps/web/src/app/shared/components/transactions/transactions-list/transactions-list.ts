import { Component, computed, input, signal } from '@angular/core'
import type { Transaction } from '@core/api/transactions.interface'
import { ArrowUpDownIcon, LucideAngularModule } from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'
import { ZardPaginationComponent } from '../../ui/pagination'
import { ZardSelectImports } from '../../ui/select/select.imports'
import { TransactionsRow } from '../transactions-row/transactions-row'

type SortKey =
	| 'date'
	| 'description'
	| 'account'
	| 'category'
	| 'amount'
	| 'status'

interface TransactionGroup {
	date: string
	label: string
	transactions: Transaction[]
}

@Component({
	selector: 'app-transactions-list',
	imports: [
		LucideAngularModule,
		TransactionsRow,
		ZardPaginationComponent,
		ZardSelectImports,
		ZardButtonComponent,
	],
	templateUrl: './transactions-list.html',
})
export class TransactionsList {
	readonly transactions = input.required<Transaction[]>()

	readonly currentPage = signal(1)

	protected readonly pageSize = 15
	protected readonly sortState = signal<{
		key: SortKey
		direction: 'asc' | 'desc'
	}>({ key: 'date', direction: 'desc' })

	readonly ArrowUpDownIcon = ArrowUpDownIcon

	readonly sortOptions: { key: SortKey; label: string }[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'description', label: 'Description' },
		{ key: 'account', label: 'Account' },
		{ key: 'category', label: 'Category' },
		{ key: 'amount', label: 'Amount' },
		{ key: 'status', label: 'Status' },
	]

	readonly sortLabel = computed(() => {
		const { key } = this.sortState()
		return this.sortOptions.find((o) => o.key === key)?.label ?? 'Date'
	})

	readonly totalPages = computed(() =>
		Math.ceil(this.transactions().length / this.pageSize),
	)

	readonly sortedTransactions = computed(() => {
		const { key, direction } = this.sortState()
		const modifier = direction === 'asc' ? 1 : -1

		return [...this.transactions()].sort((a, b) => {
			switch (key) {
				case 'date':
					return (
						(new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier
					)
				case 'description':
					return a.title.localeCompare(b.title) * modifier
				case 'account':
					return a.bankAccountId.localeCompare(b.bankAccountId) * modifier
				case 'category':
					return a.categoryId.localeCompare(b.categoryId) * modifier
				case 'amount':
					return (a.amount - b.amount) * modifier
				case 'status':
					return ((a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0)) * modifier
				default:
					return 0
			}
		})
	})

	// readonly paginatedTransactions = computed(() => {
	// 	const startPage = (this.currentPage() - 1) * this.pageSize
	// 	return this.sortedTransactions().slice(startPage, startPage + this.pageSize)
	// })

	readonly paginatedGroups = computed<TransactionGroup[]>(() => {
		const groups = new Map<string, Transaction[]>()

		for (const transaction of this.sortedTransactions()) {
			const dayKey = String(transaction.date).slice(0, 10)
			const existing = groups.get(dayKey)
			if (existing) {
				existing.push(transaction)
			} else {
				groups.set(dayKey, [transaction])
			}
		}

		const today = new Date().toISOString().slice(0, 10)
		const yesterday = new Date(Date.now() - 86_400_000)
			.toISOString()
			.slice(0, 10)

		return Array.from(groups.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.map(([date, transactions]) => ({
				date,
				label: this.buildDateLabel(date, today, yesterday),
				transactions,
			}))
	})

	onSortChange(key: string) {
		this.sortState.set({ key: key as SortKey, direction: 'desc' })
		this.currentPage.set(1)
	}

	toggleSortDirection() {
		const current = this.sortState()
		this.sortState.set({
			...current,
			direction: current.direction === 'asc' ? 'desc' : 'asc',
		})
		this.currentPage.set(1)
	}

	private buildDateLabel(
		date: string,
		today: string,
		yesterday: string,
	): string {
		if (date === today) return 'Today'
		if (date === yesterday) return 'Yesterday'
		return new Date(date).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
		})
	}
}
