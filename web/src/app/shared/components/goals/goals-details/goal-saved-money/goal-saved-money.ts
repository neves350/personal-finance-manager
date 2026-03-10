import { CurrencyPipe, DatePipe } from '@angular/common'
import {
	Component,
	computed,
	effect,
	inject,
	input,
	signal,
	untracked,
} from '@angular/core'
import { Deposit } from '@core/api/deposits.interface'
import { GoalsApi } from '@core/api/goals.api'
import { Goal } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	CheckIcon,
	CirclePlusIcon,
	HandCoinsIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { GoalsDepositForm } from '../../goals-deposit-form/goals-deposit-form'
import type { iDepositSheetData } from '../../goals-deposit-form/goals-deposit-form.interface'

@Component({
	selector: 'app-goal-saved-money',
	imports: [
		ZardCardComponent,
		ZardButtonComponent,
		LucideAngularModule,
		DatePipe,
		CurrencyPipe,
		ZardDividerComponent,
	],
	templateUrl: './goal-saved-money.html',
})
export class GoalSavedMoney {
	private readonly goalsApi = inject(GoalsApi)
	private readonly goalsService = inject(GoalsService)
	private readonly dialogService = inject(ZardDialogService)

	readonly CirclePlusIcon = CirclePlusIcon
	readonly HandCoinsIcon = HandCoinsIcon
	readonly CheckIcon = CheckIcon

	readonly goal = input.required<Goal>()
	readonly deposits = signal<Deposit[]>([])
	readonly totalDeposits = signal(0)
	readonly loading = signal(true)

	readonly displayGoal = computed(() => {
		const goals = this.goalsService.goals()
		const initial = this.goal()
		return goals.find((g) => g.id === initial.id) ?? initial
	})

	readonly hasDeposits = computed(() => this.deposits().length > 0)
	readonly totalDepositsLabel = computed(() => {
		const count = this.totalDeposits()
		return count === 1 ? '1 deposit' : `${count} deposits`
	})

	readonly formattedCurrentAmount = computed(() => {
		return this.displayGoal().currentAmount
	})

	constructor() {
		effect(() => {
			this.displayGoal()
			this.goalsService.depositsVersion()
			untracked(() => this.fetchDeposits())
		})
	}

	private fetchDeposits(): void {
		const goalId = this.goal().id
		if (!goalId) return

		this.goalsApi.getDeposits(goalId).subscribe({
			next: (res) => {
				this.deposits.set(res.deposits)
				this.totalDeposits.set(res.totalDeposits)
				this.loading.set(false)
			},
			error: () => {
				this.loading.set(false)
			},
		})
	}

	addDeposit() {
		this.dialogService.create({
			zTitle: 'Create Deposit',
			zContent: GoalsDepositForm,
			zWidth: '450px',
			zHideFooter: false,
			zOkText: 'Add Deposit',
			zOnOk: (instance: GoalsDepositForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.goal().id,
				goal: this.goal(),
			} as iDepositSheetData,
		})
	}
}
