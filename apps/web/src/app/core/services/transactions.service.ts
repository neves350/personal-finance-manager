import { computed, Injectable, inject, signal } from '@angular/core'
import { TransactionsApi } from '@core/api/transactions.api'
import {
	type CreateTransactionRequest,
	type PaginationMeta,
	type Transaction,
	type TransactionsQueryParams,
	TransactionType,
	type UpdateTransactionRequest,
} from '@core/api/transactions.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

export interface TransactionGroup {
	date: string
	label: string
	transactions: Transaction[]
}

@Injectable({
	providedIn: 'root',
})
export class TransactionsService {
	private readonly transactionsApi = inject(TransactionsApi)

	readonly transactions = signal<Transaction[]>([])
	readonly paginationMeta = signal<PaginationMeta | null>(null)
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)

	readonly activeFilters = signal<TransactionsQueryParams>({})
	readonly selectedYear = signal(new Date().getFullYear())
	readonly selectedMonth = signal(new Date().getMonth()) // 0-based

	readonly monthLabel = computed(() =>
		new Date(this.selectedYear(), this.selectedMonth()).toLocaleDateString(
			'en-US',
			{ month: 'long', year: 'numeric' },
		),
	)

	readonly hasTransactions = computed(() => this.transactions().length > 0)

	// Totals for the currently loaded transactions
	readonly monthSummary = computed(() => {
		let income = 0
		let expenses = 0

		for (const transaction of this.transactions()) {
			const amount = Number(transaction.amount)

			if (transaction.type === TransactionType.INCOME) {
				income += amount
			} else {
				expenses += amount
			}
		}

		return { income, expenses, balance: income - expenses }
	})

	// Groups transactions by day so we can show sections like "Today", "Yesterday", etc.
	readonly groupedTransactions = computed<TransactionGroup[]>(() => {
		const groups = new Map<string, Transaction[]>()

		// Put each transaction into a bucket by its date (YYYY-MM-DD)
		for (const transaction of this.transactions()) {
			const dayKey = String(transaction.date).slice(0, 10)

			const existing = groups.get(dayKey)

			if (existing) {
				existing.push(transaction)
			} else {
				groups.set(dayKey, [transaction])
			}
		}

		// Figure out today & yesterday so we can use friendly labels
		const today = new Date().toISOString().slice(0, 10)
		const yesterday = new Date(Date.now() - 86_400_000) // 24h x 60m x 60s x 1000ms = 1d
			.toISOString()
			.slice(0, 10)

		// Convert the map to an array, sorted newest first
		return Array.from(groups.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.map(([date, transactions]) => ({
				date,
				label: this.buildDateLabel(date, today, yesterday),
				transactions,
			}))
	})

	navigateMonth(direction: 1 | -1) {
		let m = this.selectedMonth() + direction
		let y = this.selectedYear()
		if (m < 0) {
			m = 11
			y--
		}
		if (m > 11) {
			m = 0
			y++
		}
		this.selectedYear.set(y)
		this.selectedMonth.set(m)
	}

	private getMonthDateRange(): { startDate: string; endDate: string } {
		const start = new Date(this.selectedYear(), this.selectedMonth(), 1)
		const end = new Date(this.selectedYear(), this.selectedMonth() + 1, 0)
		return {
			startDate: start.toISOString().slice(0, 10),
			endDate: end.toISOString().slice(0, 10),
		}
	}

	loadTransactions(
		params?: TransactionsQueryParams,
	): Observable<Transaction[]> {
		this.loading.set(true)
		this.error.set(null)
		this.activeFilters.set(params ?? {})

		const dateRange = this.getMonthDateRange()
		const mergedParams = { ...dateRange, ...params }

		return this.transactionsApi.findAll(mergedParams).pipe(
			tap({
				next: (response) => {
					this.transactions.set(response.data)
					this.paginationMeta.set(response.meta)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load transactions')
					this.loading.set(false)
				},
			}),
			map((response) => response.data),
		)
	}

	create(data: CreateTransactionRequest): Observable<Transaction> {
		this.loading.set(true)

		return this.transactionsApi.create(data).pipe(
			map((response) => response.transaction),
			switchMap((transaction) =>
				this.loadTransactions().pipe(map(() => transaction)),
			),
		)
	}

	findById(transactionId: string): Observable<Transaction> {
		return this.transactionsApi.findById(transactionId)
	}

	update(
		transactionId: string,
		data: UpdateTransactionRequest,
	): Observable<Transaction> {
		this.loading.set(true)

		return this.transactionsApi
			.update(transactionId, data)
			.pipe(
				switchMap((updatedTransaction) =>
					this.loadTransactions().pipe(map(() => updatedTransaction)),
				),
			)
	}

	delete(transactionId: string): Observable<string> {
		return this.transactionsApi
			.delete(transactionId)
			.pipe(
				switchMap((response) =>
					this.loadTransactions().pipe(map(() => response.message)),
				),
			)
	}

	// Turns a date string into "Today", "Yesterday", or a readable date
	private buildDateLabel(
		date: string,
		today: string,
		yesterday: string,
	): string {
		if (date === today) {
			return 'Today'
		}

		if (date === yesterday) {
			return 'Yesterday'
		}

		return new Date(date).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
		})
	}
}
