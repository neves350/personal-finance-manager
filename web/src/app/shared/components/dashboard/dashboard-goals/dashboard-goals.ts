import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import type { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import { CoinsIcon, LucideAngularModule } from 'lucide-angular'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-dashboard-goals',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe],
	templateUrl: './dashboard-goals.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGoals {
	private readonly goalsService = inject(GoalsService)

	readonly hasGoals = this.goalsService.hasGoals
	readonly CoinsIcon = CoinsIcon

	readonly displayGoals = computed(() =>
		this.goalsService.activeGoals().slice(0, 6),
	)

	getRemainingAmount(goal: Goal): number {
		return goal.amount - goal.currentAmount
	}

	constructor() {
		this.goalsService.loadGoals().subscribe()
	}
}
