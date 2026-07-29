import { Component, computed, inject } from '@angular/core'
import { TransactionsService } from '@core/services/transactions.service'
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'

@Component({
	selector: 'app-transactions-navigation',
	imports: [ZardButtonComponent, LucideAngularModule],
	templateUrl: './transactions-navigation.html',
})
export class TransactionsNavigation {
	private readonly transactionsService = inject(TransactionsService)

	readonly ChevronLeftIcon = ChevronLeftIcon
	readonly ChevronRightIcon = ChevronRightIcon

	readonly selectedMonth = this.transactionsService.selectedMonth
	readonly monthLabel = this.transactionsService.monthLabel

	readonly selectedYear = computed(() =>
		String(this.transactionsService.selectedYear()),
	)

	readonly isToday = computed(() => {
		const now = new Date()
		return (
			this.transactionsService.selectedMonth() === now.getMonth() &&
			this.transactionsService.selectedYear() === now.getFullYear()
		)
	})

	readonly todayButtonType = computed(() =>
		this.isToday() ? 'todayBtn' : 'goalGhost',
	)

	prevMonth() {
		this.transactionsService.navigateMonth(-1)
		this.transactionsService.loadTransactions().subscribe()
	}

	nextMonth() {
		this.transactionsService.navigateMonth(1)
		this.transactionsService.loadTransactions().subscribe()
	}

	goToToday() {
		const now = new Date()
		this.transactionsService.selectedYear.set(now.getFullYear())
		this.transactionsService.selectedMonth.set(now.getMonth())
		this.transactionsService.loadTransactions().subscribe()
	}
}
