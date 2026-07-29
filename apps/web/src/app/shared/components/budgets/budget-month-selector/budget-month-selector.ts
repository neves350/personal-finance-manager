import { Component, computed, inject } from '@angular/core'
import { BudgetsService } from '@core/services/budgets.service'
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'

@Component({
	selector: 'app-budget-month-selector',
	imports: [ZardButtonComponent, LucideAngularModule],
	templateUrl: './budget-month-selector.html',
})
export class BudgetMonthSelector {
	private readonly budgetsService = inject(BudgetsService)

	readonly ChevronLeftIcon = ChevronLeftIcon
	readonly ChevronRightIcon = ChevronRightIcon

	readonly monthLabel = computed(() =>
		new Date(
			this.budgetsService.selectedYear(),
			this.budgetsService.selectedMonth() - 1,
		).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
	)

	readonly isCurrentMonth = computed(() => {
		const now = new Date()
		return (
			this.budgetsService.selectedMonth() === now.getMonth() + 1 &&
			this.budgetsService.selectedYear() === now.getFullYear()
		)
	})

	readonly todayButtonType = computed(() =>
		this.isCurrentMonth() ? 'todayBtn' : 'goalGhost',
	)

	prevMonth() {
		this.budgetsService.navigateMonth(-1)
		this.budgetsService.loadBudget().subscribe({ error: () => {} })
	}

	nextMonth() {
		this.budgetsService.navigateMonth(1)
		this.budgetsService.loadBudget().subscribe({ error: () => {} })
	}

	goToCurrentMonth() {
		const now = new Date()
		this.budgetsService.selectedMonth.set(now.getMonth() + 1)
		this.budgetsService.selectedYear.set(now.getFullYear())
		this.budgetsService.loadBudget().subscribe({ error: () => {} })
	}
}
