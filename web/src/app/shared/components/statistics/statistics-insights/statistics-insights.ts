import { Component, computed, inject } from '@angular/core'
import { StatisticsService } from '@core/services/statistics.service'
import {
	BadgeAlertIcon,
	LightbulbIcon,
	LucideAngularModule,
	TagIcon,
	TrendingDownIcon,
} from 'lucide-angular'
import type { Insight } from '@/interfaces/insight.interface'
import { ZardCardComponent } from '../../ui/card'

@Component({
	selector: 'app-statistics-insights',
	imports: [ZardCardComponent, LucideAngularModule],
	templateUrl: './statistics-insights.html',
})
export class StatisticsInsights {
	private readonly statisticsService = inject(StatisticsService)

	readonly LightbulbIcon = LightbulbIcon

	readonly insights = computed<Insight[]>(() => {
		const result: Insight[] = []
		const overview = this.statisticsService.overview()
		const expenses = this.statisticsService.expenseCategories()

		if (!overview) return result

		// cost alert (single category > 50% of expenses)
		for (const category of expenses) {
			if (category.percentage > 50) {
				result.push({
					icon: BadgeAlertIcon,
					label: 'Cost Alert',
					color: 'text-destructive',
					message: `${category.categoryTitle} represents ${category.percentage}% of your expenses (${this.fmt(category.total)})`,
					border: 'border-destructive/30',
					bg: 'bg-destructive/5',
				})
			}
		}

		// category concentration: top category between 40-50%
		const top = expenses[0]
		if (top && top.percentage > 40 && top.percentage <= 50) {
			result.push({
				icon: TagIcon,
				label: 'Category',
				color: 'text-yellow-500',
				message: `${top.categoryTitle} represents ${top.percentage}% of your total expenses`,
				border: 'border-chart-4/30',
				bg: 'bg-chart-4/5',
			})
		}

		// spending > income
		if (
			overview.totalExpenses > overview.totalIncome &&
			overview.totalIncome > 0
		) {
			result.push({
				icon: TrendingDownIcon,
				label: 'Spending',
				color: 'text-destructive',
				message: `You spent more than you earned this period (${this.fmt(overview.totalExpenses)} vs ${this.fmt(overview.totalIncome)})`,
				border: 'border-destructive/30',
				bg: 'bg-destructive/5',
			})
		}

		// low diversity: all expenses in 1 category
		if (expenses.length === 1) {
			result.push({
				icon: TagIcon,
				label: 'Category',
				color: 'text-chart-2',
				message: `All your expenses are in a single category: ${expenses[0].categoryTitle}`,
				border: 'border-chart-2/30',
				bg: 'bg-chart-2/5',
			})
		}

		// good savings: expenses <= 50% of income
		if (
			overview.totalIncome > 0 &&
			overview.totalExpenses <= overview.totalIncome * 0.5
		) {
			result.push({
				icon: LightbulbIcon,
				label: 'Tip',
				color: 'text-primary',
				message: `You're saving more than 50% of your income this period`,
				border: 'border-primary/30',
				bg: 'bg-primary/5',
			})
		}

		return result
	})

	private fmt(value: number): string {
		return `€${new Intl.NumberFormat('pt-PT', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)}`
	}
}
