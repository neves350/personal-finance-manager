import { Component, DestroyRef, effect, inject, input } from '@angular/core'
import { Goal } from '@core/api/goals.interface'
import { GoalBreakdown } from '@/shared/components/goals/goals-details/goal-breakdown/goal-breakdown'
import { GoalCompleted } from '@/shared/components/goals/goals-details/goal-completed/goal-completed'
import { GoalHeader } from '@/shared/components/goals/goals-details/goal-header/goal-header'
import { GoalSavedMoney } from '@/shared/components/goals/goals-details/goal-saved-money/goal-saved-money'
import { GoalSummary } from '@/shared/components/goals/goals-details/goal-summary/goal-summary'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'

@Component({
	selector: 'app-goals-details',
	imports: [
		GoalHeader,
		GoalSummary,
		GoalSavedMoney,
		GoalBreakdown,
		GoalCompleted,
	],
	templateUrl: './goals-details.html',
})
export class GoalsDetails {
	readonly goal = input.required<Goal>()

	private readonly service = inject(BreadcrumbService)
	private readonly destroyRef = inject(DestroyRef)

	constructor() {
		effect(() => this.service.set(this.goal().title))
		this.destroyRef.onDestroy(() => this.service.clear())
	}
}
