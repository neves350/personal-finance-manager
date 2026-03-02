import { Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import type { Goal } from '@core/api/goals.interface'
import { GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	ArrowBigLeftDashIcon,
	LucideAngularModule,
	PencilIcon,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { GoalsForm } from '../../goals-form/goals-form'
import type { iGoalsData } from '../../goals-form/goals-form.interface'

@Component({
	selector: 'app-goal-header',
	imports: [LucideAngularModule, ZardButtonComponent, RouterLink],
	templateUrl: './goal-header.html',
})
export class GoalHeader {
	private readonly dialogService = inject(ZardDialogService)
	private readonly goalsService = inject(GoalsService)

	readonly ArrowBigLeftDashIcon = ArrowBigLeftDashIcon
	readonly PencilIcon = PencilIcon

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
			return `Account: ${goal.bankAccount.name} • ${base}`
		}

		if (goal.type === GoalType.SPENDING_LIMIT && goal.category) {
			return `Category: ${goal.category.title} • ${base}`
		}

		return base
	})

	updateCard() {
		const current = this.displayGoal()

		this.dialogService.create({
			zTitle: 'Edit Goal',
			zContent: GoalsForm,
			zWidth: '650px',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: GoalsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
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
