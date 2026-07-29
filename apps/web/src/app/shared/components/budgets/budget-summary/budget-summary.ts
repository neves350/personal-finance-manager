import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core'
import type { BudgetSummary as BudgetSummaryType } from '@core/api/budgets.interface'
import { ZardCardComponent } from '../../ui/card'
import { ZardProgressBarComponent } from '../../ui/progress-bar'

@Component({
	selector: 'app-budget-summary',
	imports: [ZardCardComponent, ZardProgressBarComponent, CurrencyPipe],
	templateUrl: './budget-summary.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetSummary {
	readonly summary = input.required<BudgetSummaryType>()

	readonly spentPercent = computed(() => {
		const s = this.summary()
		if (s.totalAllocated === 0) return 0
		return Math.min(Math.round((s.totalSpent / s.totalAllocated) * 100), 100)
	})

	readonly spentBarType = computed(() => {
		const pct = this.spentPercent()
		if (pct >= 100) return 'destructive' as const
		if (pct >= 80) return 'accent' as const
		return 'default' as const
	})

	readonly statusPercent = computed(() => {
		const s = this.summary()
		if (s.envelopeCount === 0) return { onTrack: 0, warning: 0, overspent: 0 }
		const onTrack = s.envelopeCount - s.warningCount - s.overspentCount
		return {
			onTrack: Math.round((onTrack / s.envelopeCount) * 100),
			warning: Math.round((s.warningCount / s.envelopeCount) * 100),
			overspent: Math.round((s.overspentCount / s.envelopeCount) * 100),
		}
	})

	readonly onTrackCount = computed(() => {
		const s = this.summary()
		return s.envelopeCount - s.warningCount - s.overspentCount
	})
}
