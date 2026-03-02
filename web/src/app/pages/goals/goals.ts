import { Component, inject } from '@angular/core'
import { GoalsService } from '@core/services/goals.service'
import { GoalIcon, LucideAngularModule, PlusIcon } from 'lucide-angular'
import { GoalsForm } from '@/shared/components/goals/goals-form/goals-form'
import { GoalsList } from '@/shared/components/goals/goals-list/goals-list'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import {
	ZardTabComponent,
	ZardTabGroupComponent,
} from '@/shared/components/ui/tabs'

@Component({
	selector: 'app-goals',
	imports: [
		ZardButtonComponent,
		LucideAngularModule,
		ZardCardComponent,
		GoalsList,
		ZardTabGroupComponent,
		ZardTabComponent,
	],
	templateUrl: './goals.html',
})
export class Goals {
	readonly PlusIcon = PlusIcon
	readonly GoalIcon = GoalIcon

	private readonly dialogService = inject(ZardDialogService)
	private readonly goalsService = inject(GoalsService)

	readonly hasGoals = this.goalsService.hasGoals
	readonly goals = this.goalsService.goals
	readonly activeGoals = this.goalsService.activeGoals
	readonly completedGoals = this.goalsService.completedGoals

	ngOnInit(): void {
		this.goalsService.loadGoals().subscribe()
	}

	openSheet() {
		this.dialogService.create({
			zTitle: 'New Goal',
			zContent: GoalsForm,
			zWidth: '450px',
			zHideFooter: false,
			zOkText: 'Create Goal',
			zOnOk: (instance: GoalsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
