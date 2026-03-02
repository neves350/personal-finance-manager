import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import type { Goal } from '@core/api/goals.interface'
import { LucideAngularModule } from 'lucide-angular'
import { GoalsCard } from '../goals-card/goals-card'

@Component({
	selector: 'app-goals-list',
	imports: [LucideAngularModule, GoalsCard],
	templateUrl: './goals-list.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalsList {
	readonly goals = input.required<Goal[]>()
}
