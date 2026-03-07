import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import type { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import { HandCoinsIcon, LucideAngularModule } from 'lucide-angular'
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
	readonly HandCoinsIcon = HandCoinsIcon

	readonly displayGoals = computed(() =>
		this.goalsService.activeGoals().slice(0, 6),
	)
	readonly CIRCUMFERENCE = 2 * Math.PI * 16

	getRemainingAmount(goal: Goal): number {
		return goal.amount - goal.currentAmount
	}

	getStrokeDashoffset(progress: number): number {
		const clamped = Math.min(Math.max(progress, 0), 100)
		return this.CIRCUMFERENCE * (1 - clamped / 100)
	}

	getStrokeColor(status: string): string {
		const colors: Record<string, string> = {
			ON_TRACK: '#10b981',
			OFF_PACE: '#f59e0b',
			OVER_PACE: '#14b8a6',
			COMPLETED: '#3b82f6',
		}
		return colors[status] ?? '#a3a3a3'
	}

	constructor() {
		this.goalsService.loadGoals().subscribe()
	}

}
