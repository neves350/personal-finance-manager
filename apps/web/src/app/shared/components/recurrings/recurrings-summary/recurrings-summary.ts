import { CurrencyPipe } from '@angular/common'
import { Component, computed, inject } from '@angular/core'
import { RecurringsService } from '@core/services/recurrings.service'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-recurrings-summary',
	imports: [ZardCardComponent, CurrencyPipe],
	templateUrl: './recurrings-summary.html',
})
export class RecurringsSummary {
	private readonly recurringsService = inject(RecurringsService)

	readonly monthSummary = this.recurringsService.monthSummary

	readonly balanceSign = computed(() => {
		const balance = this.monthSummary().balance
		return balance >= 0 ? '+' : '-'
	})
	readonly adsBalance = computed(() => {
		return Math.abs(this.monthSummary().balance)
	})
}
