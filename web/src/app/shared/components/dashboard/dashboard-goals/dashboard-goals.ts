import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { type Goal, GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	LucideAngularModule,
	type LucideIconData,
	PiggyBankIcon,
	ReceiptIcon,
} from 'lucide-angular'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-dashboard-goals',
	imports: [ZardCardComponent, LucideAngularModule, CurrencyPipe, RouterLink],
	templateUrl: './dashboard-goals.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGoals {
	private readonly goalsService = inject(GoalsService)

	readonly hasGoals = this.goalsService.hasGoals

	readonly goalTypeIcons: Record<
		GoalType,
		{ icon: LucideIconData; style: string }
	> = {
		[GoalType.SAVINGS]: {
			icon: PiggyBankIcon,
			style: 'bg-primary/15 text-primary',
		},
		[GoalType.SPENDING_LIMIT]: {
			icon: ReceiptIcon,
			style: 'bg-destructive/15 text-destructive',
		},
	}

	readonly displayGoals = computed(() =>
		this.goalsService.activeGoals().slice(0, 4),
	)

	getRemainingAmount(goal: Goal): number {
		return goal.amount - goal.currentAmount
	}

	constructor() {
		this.goalsService.loadGoals().subscribe()
	}
}
