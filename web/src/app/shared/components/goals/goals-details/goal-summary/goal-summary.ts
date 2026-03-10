import { Component, computed, inject, input } from '@angular/core'
import { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import { HandCoinsIcon, LucideAngularModule, TargetIcon } from 'lucide-angular'
import {
	ZardBadgeComponent,
	type ZardBadgeVariants,
} from '@/shared/components/ui/badge'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardProgressBarComponent } from '@/shared/components/ui/progress-bar'

@Component({
	selector: 'app-goal-summary',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardDividerComponent,
		ZardBadgeComponent,
		ZardProgressBarComponent,
	],
	templateUrl: './goal-summary.html',
})
export class GoalSummary {
	private readonly goalsService = inject(GoalsService)

	readonly TargetIcon = TargetIcon
	readonly HandCoinsIcon = HandCoinsIcon

	readonly goal = input.required<Goal>()

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly formattedAmount = computed(() => {
		return this.displayGoal().amount
	})

	readonly formattedCurrentAmount = computed(() => {
		return this.displayGoal().currentAmount
	})

	readonly formattedRemainingAmount = computed(() => {
		const goal = this.displayGoal()
		const remaining = Math.max(goal.amount - goal.currentAmount, 0)
		return remaining
	})

	readonly paceBadge = computed(() => {
		const map: Record<
			string,
			{ type: ZardBadgeVariants['zType']; label: string; dot: string }
		> = {
			ON_TRACK: { type: 'success', label: 'On Track', dot: 'bg-green-500' },
			COMPLETED: { type: 'completed', label: 'Completed', dot: 'bg-teal-500' },
			OFF_PACE: { type: 'warning', label: 'Off Pace', dot: 'bg-yellow-500' },
			OVER_PACE: { type: 'destructive', label: 'Over Pace', dot: 'bg-white' },
		}
		return (
			map[this.displayGoal().paceStatus] ?? {
				type: 'secondary',
				label: this.displayGoal().paceStatus,
				dot: 'bg-green-500',
			}
		)
	})
}
