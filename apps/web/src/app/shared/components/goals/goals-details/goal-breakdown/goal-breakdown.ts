import { CurrencyPipe, DatePipe } from '@angular/common'
import { Component, computed, inject, input } from '@angular/core'
import { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	CalendarClockIcon,
	ClipboardPenIcon,
	ClockIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardBadgeComponent } from '@/shared/components/ui/badge'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-goal-breakdown',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardBadgeComponent,
		CurrencyPipe,
		DatePipe,
	],
	templateUrl: './goal-breakdown.html',
})
export class GoalBreakdown {
	private readonly goalsService = inject(GoalsService)

	readonly goal = input.required<Goal>()

	readonly ClipboardPenIcon = ClipboardPenIcon
	readonly ClockIcon = ClockIcon
	readonly CalendarClockIcon = CalendarClockIcon

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly formattedAmount = computed(() => {
		return this.displayGoal().amount
	})

	readonly formattedDailyAmount = computed(
		() => this.displayGoal().breakdown?.daily ?? 0,
	)

	readonly formattedWeeklyAmount = computed(
		() => this.displayGoal().breakdown?.weekly ?? 0,
	)

	readonly formattedMonthlyAmount = computed(
		() => this.displayGoal().breakdown?.monthly ?? 0,
	)

	readonly formattedDaysLeft = computed(() => {
		const days = this.displayGoal().breakdown?.daysRemaining ?? 0
		return days === 1 ? '1 day left' : `${days} days left`
	})
}
