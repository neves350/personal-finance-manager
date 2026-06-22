import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { BudgetsService } from '@core/services/budgets.service'
import { BadgeEuroIcon, LucideAngularModule } from 'lucide-angular'
import { CATEGORY_ICON_MAP } from '../../categories/category-icons'
import { ZardCardComponent } from '../../ui/card'
import { ZardProgressBarComponent } from '../../ui/progress-bar'

@Component({
	selector: 'app-dashboard-budgets',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		CurrencyPipe,
		RouterLink,
		ZardProgressBarComponent,
	],
	templateUrl: './dashboard-budgets.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBudgets {
	private readonly budgetsService = inject(BudgetsService)

	readonly hasBudget = this.budgetsService.hasBudget
	readonly BadgeEuroIcon = BadgeEuroIcon
	readonly iconMap = CATEGORY_ICON_MAP

	readonly summary = this.budgetsService.summary
	readonly envelopesAbove80 = this.budgetsService.envelopesAbove80Pct
	readonly envelopeCount = computed(
		() => this.budgetsService.summary()?.envelopeCount ?? 0,
	)
	readonly topCritical = this.budgetsService.topCriticalEnvelopes

	readonly monthLabel = computed(() => {
		const m = this.budgetsService.selectedMonth()
		const y = this.budgetsService.selectedYear()
		return new Date(y, m - 1).toLocaleDateString('en-US', {
			month: 'long',
		})
	})

	constructor() {
		this.budgetsService.loadBudget().subscribe({ error: () => {} })
	}

	getProgressType(status: string) {
		if (status === 'overspent') return 'destructive' as const
		if (status === 'warning') return 'accent' as const
		return 'default' as const
	}
}
