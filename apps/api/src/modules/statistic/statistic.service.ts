import { Injectable } from '@nestjs/common'

import { Type } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { ByCategoryQueryDto } from './dtos/by-category-query.dto'
import { ByCategoryResponseDto } from './dtos/by-category-response.dto'
import { DailyTotalsResponseDto } from './dtos/daily-totals-response.dto'
import { OverviewResponseDto } from './dtos/overview-response.dto'
import { QueryStatisticsDto } from './dtos/query-statistics.dto'
import { TrendsResponseDto } from './dtos/trends-response-dto'
import { CategoryService } from './helpers/category.helper'
import { NumberHelper } from './helpers/number.helper'
import { TransactionFiltersService } from './helpers/transaction-filters.helper'
import { TrendsService } from './helpers/trends.helper'

@Injectable()
export class StatisticService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly transactionFiltersService: TransactionFiltersService,
		private readonly categoryService: CategoryService,
		private readonly trendsService: TrendsService,
	) {}

	async getOverview(
		userId: string,
		query: QueryStatisticsDto,
	): Promise<OverviewResponseDto> {
		// build filters
		const filters = this.transactionFiltersService.buildFilters(userId, query)

		// get expenses stats
		const expenseStats = await this.prisma.transaction.aggregate({
			where: {
				...filters,
				type: Type.EXPENSE,
			},
			_sum: { amount: true },
			_count: true,
			_avg: { amount: true },
		})

		// get incomes stats
		const incomeStats = await this.prisma.transaction.aggregate({
			where: {
				...filters,
				type: Type.INCOME,
			},
			_sum: { amount: true },
			_count: true,
			_avg: { amount: true },
		})

		// decimal to numer
		const totalExpenses = NumberHelper.toNumber(expenseStats._sum.amount)
		const totalIncome = NumberHelper.toNumber(incomeStats._sum.amount)
		const averageExpense = NumberHelper.toNumber(expenseStats._avg.amount)
		const averageIncome = NumberHelper.toNumber(incomeStats._avg.amount)

		// get top 3 categories
		const topExpenseCategories =
			await this.categoryService.getTopExpenseCategories(filters, totalExpenses)

		return {
			totalExpenses,
			totalIncome,
			balance: totalIncome - totalExpenses,
			transactionCount: expenseStats._count + incomeStats._count,
			expenseCount: expenseStats._count,
			incomeCount: incomeStats._count,
			averageExpense,
			averageIncome,
			topExpenseCategories,
		}
	}

	async getByCategory(
		userId: string,
		query: ByCategoryQueryDto,
	): Promise<ByCategoryResponseDto> {
		// filters
		const filters = this.transactionFiltersService.buildFilters(userId, query)
		const type = query.type || Type.EXPENSE

		// get categories
		const categories = await this.categoryService.getCategoryBreakdown(
			filters,
			type,
		)

		// calculate total
		const totalAmount = categories.reduce((sum, cat) => sum + cat.total, 0)
		const totalTransactions = categories.reduce(
			(sum, cat) => sum + cat.transactionCount,
			0,
		)

		return {
			type,
			totalAmount,
			totalTransactions,
			categories,
		}
	}

	async getTrends(
		userId: string,
		query: QueryStatisticsDto,
	): Promise<TrendsResponseDto> {
		// get actual period data
		const currentFilters = this.transactionFiltersService.buildFilters(
			userId,
			query,
		)
		const currentData = await this.getPeriodsStats(currentFilters)

		// get last period data
		const previousFilters =
			this.trendsService.calculatePreviousPeriod(currentFilters)
		const previousData = await this.getPeriodsStats(previousFilters)

		// calculate percentual changes
		const expensesChange = this.trendsService.calculatePercentageChange(
			previousData.expenses,
			currentData.expenses,
		)
		const incomeChange = this.trendsService.calculatePercentageChange(
			previousData.income,
			currentData.income,
		)
		const balanceChange = this.trendsService.calculatePercentageChange(
			previousData.balance,
			currentData.balance,
		)

		return {
			current: {
				period: this.trendsService.getPeriodLabel(currentFilters),
				expenses: currentData.expenses,
				income: currentData.income,
				balance: currentData.balance,
			},
			previous: {
				period: this.trendsService.getPeriodLabel(previousFilters),
				expenses: previousData.expenses,
				income: previousData.income,
				balance: previousData.balance,
			},
			change: {
				expenses: expensesChange,
				income: incomeChange,
				balance: balanceChange,
			},
		}
	}

	async dailyTotals(
		userId: string,
		query: QueryStatisticsDto,
	): Promise<DailyTotalsResponseDto> {
		const filters = this.transactionFiltersService.buildFilters(userId, query)

		const results = await this.prisma.transaction.groupBy({
			by: ['date', 'type'],
			where: filters,
			_sum: { amount: true },
			orderBy: { date: 'asc' },
		})

		const startDate = filters.date?.gte as Date
		const endDate = filters.date?.lte as Date

		const map = new Map<string, { income: number; expenses: number }>()

		for (const row of results) {
			const dayKey = row.date.toISOString().slice(0, 10)
			const entry = map.get(dayKey) ?? { income: 0, expenses: 0 }

			const amount = NumberHelper.toNumber(row._sum.amount)

			if (row.type === Type.INCOME) {
				entry.income += amount
			} else {
				entry.expenses += amount
			}

			map.set(dayKey, entry)
		}

		// fill days without transactions
		const labels: string[] = []
		const income: number[] = []
		const expenses: number[] = []
		const balance: number[] = []

		const cursor = new Date(startDate)
		cursor.setUTCHours(0, 0, 0, 0)

		while (cursor <= endDate) {
			const key = cursor.toISOString().slice(0, 10)
			const entry = map.get(key) ?? { income: 0, expenses: 0 }

			labels.push(key)
			income.push(entry.income)
			expenses.push(entry.expenses)
			balance.push(entry.income - entry.expenses)

			cursor.setUTCDate(cursor.getUTCDate() + 1)
		}

		return {
			labels,
			income,
			expenses,
			balance,
		}
	}

	private async getPeriodsStats(filters: any) {
		// Buscar despesas
		const expenses = await this.prisma.transaction.aggregate({
			where: { ...filters, type: Type.EXPENSE },
			_sum: { amount: true },
		})

		// Buscar receitas
		const income = await this.prisma.transaction.aggregate({
			where: { ...filters, type: Type.INCOME },
			_sum: { amount: true },
		})

		// Converter e calcular
		const expensesTotal = Number(expenses._sum.amount || 0)
		const incomeTotal = Number(income._sum.amount || 0)
		const balance = incomeTotal - expensesTotal

		return {
			expenses: expensesTotal,
			income: incomeTotal,
			balance,
		}
	}
}
