import { Component, inject, output, signal } from '@angular/core'
import type { TransactionsQueryParams } from '@core/api/transactions.interface'
import { TransactionsService } from '@core/services/transactions.service'
import { TransactionsNavigation } from '../transactions-navigation/transactions-navigation'
import { TransactionsSearch } from '../transactions-search/transactions-search'

@Component({
	selector: 'app-transactions-toolbar',
	imports: [TransactionsNavigation, TransactionsSearch],
	templateUrl: './transactions-toolbar.html',
})
export class TransactionsToolbar {
	private readonly transactionsService = inject(TransactionsService)

	readonly currentPage = signal(1)
	readonly searchQuery = signal('')

	readonly searchChange = output<string>()

	onSearch(query: string) {
		this.searchQuery.set(query)
		this.searchChange.emit(query)
	}

	onFilterChange(params: TransactionsQueryParams) {
		this.currentPage.set(1)
		this.transactionsService.loadTransactions(params).subscribe()
	}

	onFilterReset() {
		this.searchQuery.set('')
		this.searchChange.emit('')
		this.currentPage.set(1)
		this.transactionsService.loadTransactions().subscribe()
	}
}
