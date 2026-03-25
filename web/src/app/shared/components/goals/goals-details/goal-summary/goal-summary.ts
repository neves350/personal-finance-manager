import { CurrencyPipe } from '@angular/common'
import { Component, computed, inject, input } from '@angular/core'
import { Goal, GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	LucideAngularModule,
	LucideIconData,
	PiggyBankIcon,
	ReceiptIcon,
	TrophyIcon,
} from 'lucide-angular'
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
		CurrencyPipe,
	],
	templateUrl: './goal-summary.html',
})
export class GoalSummary {
	private readonly goalsService = inject(GoalsService)

	readonly TrophyIcon = TrophyIcon

	readonly goal = input.required<Goal>()

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly goalIcon = computed(() => {
		const iconMap: Record<GoalType, { icon: LucideIconData; style: string }> = {
			[GoalType.SAVINGS]: {
				icon: PiggyBankIcon,
				style: 'bg-primary/20 text-primary',
			},
			[GoalType.SPENDING_LIMIT]: {
				icon: ReceiptIcon,
				style: 'bg-destructive/20 text-destructive',
			},
		}
		return iconMap[this.goal().type]
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
			ON_TRACK: { type: 'success', label: 'On Track', dot: 'bg-primary' },
			COMPLETED: {
				type: 'success',
				label: '100% Completed',
				dot: 'bg-primary',
			},
			OFF_PACE: { type: 'warning', label: 'Off Pace', dot: 'bg-chart-4' },
			OVER_PACE: {
				type: 'destructive',
				label: 'Over Pace',
				dot: 'bg-destructive',
			},
		}
		return (
			map[this.displayGoal().paceStatus] ?? {
				type: 'secondary',
				label: this.displayGoal().paceStatus,
				dot: 'bg-muted-foreground',
			}
		)
	})
}
