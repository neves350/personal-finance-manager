import { Component, computed, inject } from '@angular/core'
import { StatisticsService } from '@core/services/statistics.service'
import { LucideAngularModule } from 'lucide-angular'
import { CATEGORY_ICON_MAP } from '../../categories/category-icons'
import { ZardCardComponent } from '../../ui/card'

const BAR_CLASSES = ['bg-primary/80', 'bg-chart-2/80', 'bg-destructive/80']

const DOT_CLASSES = ['bg-primary', 'bg-chart-2', 'bg-destructive']

@Component({
	selector: 'app-statistics-breakdown',
	imports: [ZardCardComponent, LucideAngularModule],
	templateUrl: './statistics-breakdown.html',
})
export class StatisticsBreakdown {
	private readonly statisticsService = inject(StatisticsService)

	readonly iconMap = CATEGORY_ICON_MAP

	readonly topCategories = computed(() =>
		this.statisticsService.expenseCategories().slice(0, 3),
	)

	readonly expenseTotal = computed(
		() => this.statisticsService.expenseByCategory()?.totalAmount ?? 0,
	)

	getBarClass(index: number): string {
		return BAR_CLASSES[index] ?? BAR_CLASSES[0]
	}

	getDotClass(index: number): string {
		return DOT_CLASSES[index] ?? DOT_CLASSES[0]
	}

	formatAmount(value: number): string {
		return new Intl.NumberFormat('pt-PT', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)
	}
}
