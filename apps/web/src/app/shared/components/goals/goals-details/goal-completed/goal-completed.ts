import { CurrencyPipe, DatePipe } from '@angular/common'
import { Component, computed, inject, input } from '@angular/core'
import { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	CircleCheckIcon,
	LucideAngularModule,
	PartyPopperIcon,
} from 'lucide-angular'
import { ZardBadgeComponent } from '@/shared/components/ui/badge'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-goal-completed',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardBadgeComponent,
		CurrencyPipe,
		DatePipe,
	],
	templateUrl: './goal-completed.html',
})
export class GoalCompleted {
	private readonly goalsService = inject(GoalsService)

	readonly goal = input.required<Goal>()

	readonly PartyPopperIcon = PartyPopperIcon
	readonly CircleCheckIcon = CircleCheckIcon

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly formattedCurrentAmount = computed(() => {
		return this.displayGoal().currentAmount
	})
}
