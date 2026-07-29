import { Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { Goal } from '@core/api/goals.interface'
import { GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	ArrowLeftIcon,
	LucideAngularModule,
	SquarePenIcon,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardSheetService } from '@/shared/components/ui/sheet'
import { GoalsForm } from '../../goals-form/goals-form'
import type { iGoalsData } from '../../goals-form/goals-form.interface'

@Component({
	selector: 'app-goal-header',
	imports: [LucideAngularModule, ZardButtonComponent, RouterLink],
	templateUrl: './goal-header.html',
})
export class GoalHeader {
	private readonly sheetService = inject(ZardSheetService)
	private readonly goalsService = inject(GoalsService)

	readonly ArrowLeftIcon = ArrowLeftIcon
	readonly SquarePenIcon = SquarePenIcon

	readonly goal = input.required<Goal>()

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly typeLabel = computed(() => {
		const goal = this.displayGoal()
		const base = { SAVINGS: 'Savings', SPENDING_LIMIT: 'Spendings' }[goal.type]

		if (goal.type === GoalType.SAVINGS && goal.bankAccount) {
			return `Account ${goal.bankAccount.name} • ${base}`
		}

		if (goal.type === GoalType.SPENDING_LIMIT && goal.category) {
			return `Category ${goal.category.title} • ${base}`
		}

		return base
	})

	updateCard() {
		const current = this.displayGoal()

		this.sheetService.create({
			zTitle: 'Edit Goal',
			zContent: GoalsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: GoalsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'sm:rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: current.id,
				title: current.title,
				type: current.type,
				amount: current.amount,
				bankAccountId: current.bankAccountId,
				categoryId: current.categoryId,
				startDate: current.startDate,
				endDate: current.endDate,
			} as iGoalsData,
		})
	}
}
