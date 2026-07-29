import { CurrencyPipe, DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { Goal, GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import {
	CircleCheckIcon,
	EllipsisIcon,
	EyeIcon,
	LucideAngularModule,
	type LucideIconData,
	PiggyBankIcon,
	PlusIcon,
	ReceiptIcon,
	SquarePenIcon,
	Trash2Icon,
	TrophyIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardPopoverComponent, ZardPopoverDirective } from '../../ui/popover'
import { ZardProgressBarComponent } from '../../ui/progress-bar'
import { ZardSheetService } from '../../ui/sheet'
import { GoalsDepositForm } from '../goals-deposit-form/goals-deposit-form'
import type { iDepositSheetData } from '../goals-deposit-form/goals-deposit-form.interface'
import { GoalsForm } from '../goals-form/goals-form'
import type { iGoalsData } from '../goals-form/goals-form.interface'

@Component({
	selector: 'app-goals-card',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		RouterLink,
		ZardProgressBarComponent,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardDividerComponent,
		DatePipe,
		CurrencyPipe,
		ZardCardComponent,
	],
	templateUrl: './goals-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe],
})
export class GoalsCard {
	private readonly dialogService = inject(ZardDialogService)
	private readonly sheetService = inject(ZardSheetService)
	private readonly goalsService = inject(GoalsService)
	private readonly datePipe = inject(DatePipe)

	readonly goal = input.required<Goal>()

	readonly EllipsisIcon = EllipsisIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly EyeIcon = EyeIcon
	readonly PlusIcon = PlusIcon
	readonly TrophyIcon = TrophyIcon
	readonly CircleCheckIcon = CircleCheckIcon

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

	readonly typeLabel = computed(() => {
		const goal = this.goal()
		const base = { SAVINGS: 'Savings', SPENDING_LIMIT: 'Spendings' }[goal.type]

		if (goal.type === GoalType.SAVINGS && goal.bankAccount) {
			return `Account ${goal.bankAccount.name} • ${base}`
		}

		if (goal.type === GoalType.SPENDING_LIMIT && goal.category) {
			return `Category ${goal.category.title} • ${base}`
		}

		return base
	})

	readonly typeLabelAmount = computed(
		() => ({ SAVINGS: 'Saved', SPENDING_LIMIT: 'Spent' })[this.goal().type],
	)

	readonly amount = computed(() => this.goal().amount)
	readonly currentAmount = computed(() => this.goal().currentAmount)
	readonly remainingAmount = computed(
		() => this.goal().amount - this.goal().currentAmount,
	)

	readonly paceBadge = computed(() => {
		const completedDate = this.datePipe.transform(
			this.goal().updatedAt,
			'mediumDate',
		)

		const map: Record<
			string,
			{
				label: string
				color: string
				dot: string
			}
		> = {
			ON_TRACK: {
				label: 'On Track',
				color: 'text-primary',
				dot: 'bg-primary',
			},
			COMPLETED: {
				label: completedDate ?? 'Completed',
				color: 'text-primary',
				dot: 'bg-primary',
			},
			OFF_PACE: {
				label: 'Off Pace',
				color: 'text-chart-4',
				dot: 'bg-chart-4',
			},
			OVER_PACE: {
				label: 'Over Pace',
				color: 'text-destructive',
				dot: 'bg-destructive',
			},
		}
		return (
			map[this.goal().paceStatus] ?? {
				label: this.goal().paceStatus,
				color: 'text-muted-foreground',
				dot: 'bg-muted-foreground',
			}
		)
	})

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
				'sm:rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.goal().id,
				goal: this.goal(),
			} as iDepositSheetData,
		})
	}

	updateCard() {
		this.sheetService.create({
			zTitle: 'Edit Goal',
			zContent: GoalsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: GoalsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'sm:rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.goal().id,
				title: this.goal().title,
				type: this.goal().type,
				amount: this.goal().amount,
				bankAccountId: this.goal().bankAccountId,
				categoryId: this.goal().categoryId,
				startDate: this.goal().startDate,
				endDate: this.goal().endDate,
			} as iGoalsData,
		})
	}

	deleteCard() {
		const goalId = this.goal().id
		if (!goalId) return

		return this.dialogService.create({
			zTitle: `Remove goal?`,
			zDescription: `Are you sure you want to delete the recurring entry "${this.goal().title}"? This action cannot be undone.`,
			zCancelText: 'Cancel',
			zOkText: 'Delete Goal',
			zOkDestructive: true,
			zWidth: '500px',
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(this.goalsService.delete(goalId))
					toast.success(message)
					this.goalsService.loadGoals().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to delete goal')
					return false
				}
			},
		})
	}
}
