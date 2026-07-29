/**
 * ENUM
 */
export enum PeriodType {
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
}

export interface StatisticsQueryParams {
	period?: PeriodType
	bankAccountId?: string
	startDate?: string
	endDate?: string
	type?: string
}

/**
 * SHARED
 */
export interface CategoryBreakdownItem {
	categoryId: string
	categoryTitle: string
	categoryIcon: string
	total: number
	percentage: number
	transactionCount: number
}

/**
 * OVERVIEW
 */
export interface StatisticsOverview {
	totalExpenses: number
	totalIncome: number
	balance: number
	transactionCount: number
	expenseCount: number
	incomeCount: number
	averageExpense: number
	averageIncome: number
	topExpenseCategories: CategoryBreakdownItem[]
	comparisonWithPreviousPeriod?: {
		expensesChange: number
		incomeChange: number
		balanceChange: number
	}
}

/**
 * TRENDS
 */
export interface StatisticsTrends {
	current: {
		period: string
		expenses: number
		income: number
		balance: number
	}
	previous: {
		period: string
		expenses: number
		income: number
		balance: number
	}
	change: {
		expenses: string
		income: string
		balance: string
	}
}

/**
 * BY CATEGORY
 */
export interface StatisticsByCategory {
	type: string
	totalAmount: number
	totalTransactions: number
	categories: CategoryBreakdownItem[]
}

/**
 * DAILY TOTALS
 */
export interface StatisticsDailyTotals {
	labels: string[]
	income: number[]
	expenses: number[]
	balance: number[]
}
