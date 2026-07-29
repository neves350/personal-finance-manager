import { TestBed } from '@angular/core/testing'
import { StatisticsApi } from '@core/api/statistics.api'
import {
	type CategoryBreakdownItem,
	PeriodType,
	type StatisticsByCategory,
	type StatisticsDailyTotals,
	type StatisticsOverview,
	type StatisticsTrends,
} from '@core/api/statistics.interface'
import { StatisticsService } from '@core/services/statistics.service'
import { mockStatistics } from '@core/testing/mocks'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

// shared mock data
const overview: StatisticsOverview = {
	totalExpenses: 500,
	totalIncome: 1000,
	balance: 500,
	transactionCount: 10,
	expenseCount: 6,
	incomeCount: 4,
	averageExpense: 83.33,
	averageIncome: 250,
	topExpenseCategories: [],
}

const trends: StatisticsTrends = {
	current: { period: '2026-04', expenses: 500, income: 1000, balance: 500 },
	previous: { period: '2026-03', expenses: 400, income: 900, balance: 500 },
	change: { expenses: '+25%', income: '+11%', balance: '0%' },
}

const expenseByCategory: StatisticsByCategory = {
	type: 'EXPENSE',
	totalAmount: 500,
	totalTransactions: 6,
	categories: [],
}

const incomeByCategory: StatisticsByCategory = {
	type: 'INCOME',
	totalAmount: 1000,
	totalTransactions: 4,
	categories: [],
}

const dailyTotals: StatisticsDailyTotals[] = [
	{ labels: ['2026-04-01'], income: [100], expenses: [50], balance: [50] },
]

// help function
function setupHappyPath() {
	mockStatistics.getOverview.mockReturnValue(of(overview))
	mockStatistics.getTrends.mockReturnValue(of(trends))
	mockStatistics.getByCategory
		.mockReturnValueOnce(of(expenseByCategory))
		.mockReturnValueOnce(of(incomeByCategory))
	mockStatistics.getDailyTotals.mockReturnValue(of(dailyTotals))
}

describe('StatisticsService', () => {
	let service: StatisticsService

	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [{ provide: StatisticsApi, useValue: mockStatistics }],
		})

		service = TestBed.inject(StatisticsService)
	})

	describe('initial state', () => {
		it('should initialize with default signal values', () => {
			expect(service.period()).toBe(PeriodType.MONTH)
			expect(service.overview()).toBeNull()
			expect(service.trends()).toBeNull()
			expect(service.expenseByCategory()).toBeNull()
			expect(service.incomeByCategory()).toBeNull()
			expect(service.dailyTotals()).toBeNull()
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()
		})
	})

	describe('loadStatistics()', () => {
		it('should update all signals on success', () => {
			setupHappyPath()

			service.loadStatistics()

			expect(service.overview()).toEqual(overview)
			expect(service.trends()).toEqual(trends)
			expect(service.expenseByCategory()).toEqual(expenseByCategory)
			expect(service.incomeByCategory()).toEqual(incomeByCategory)
			expect(service.dailyTotals()).toEqual(dailyTotals)
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()
		})
		it('should set period from params', () => {
			setupHappyPath()

			service.loadStatistics({ period: PeriodType.YEAR })

			expect(service.period()).toBe(PeriodType.YEAR)
		})
		it('should not change period when params has no period', () => {
			setupHappyPath()
			// default period is PeriodType.MONTH
			service.loadStatistics({ bankAccountId: 'a-1' })

			expect(service.period()).toBe(PeriodType.MONTH)
		})
		it('should forward params to all API methods', () => {
			const params = { period: PeriodType.WEEK }
			setupHappyPath()

			service.loadStatistics(params)

			expect(mockStatistics.getOverview).toHaveBeenCalledWith(params)
			expect(mockStatistics.getTrends).toHaveBeenCalledWith(params)
			expect(mockStatistics.getDailyTotals).toHaveBeenCalledWith(params)
		})
		it('should call getByCategory twice — once for EXPENSE and once for INCOME', () => {
			const params = { period: PeriodType.MONTH }
			setupHappyPath()

			service.loadStatistics(params)

			expect(mockStatistics.getByCategory).toHaveBeenCalledTimes(2)
			expect(mockStatistics.getByCategory).toHaveBeenCalledWith({
				...params,
				type: 'EXPENSE',
			})
			expect(mockStatistics.getByCategory).toHaveBeenCalledWith({
				...params,
				type: 'INCOME',
			})
		})
		it('should set error and reset loading when any API call fails', () => {
			// override only getOverview — forkJoin propagates the first error
			mockStatistics.getOverview.mockReturnValue(
				throwError(() => new Error('API error')),
			)
			mockStatistics.getTrends.mockReturnValue(of(trends))
			mockStatistics.getByCategory.mockReturnValue(of(expenseByCategory))
			mockStatistics.getDailyTotals.mockReturnValue(of(dailyTotals))

			service.loadStatistics()

			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('API error')
		})
		it('should fall back to default error message when err.message is missing', () => {
			mockStatistics.getOverview.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)
			mockStatistics.getTrends.mockReturnValue(of(trends))
			mockStatistics.getByCategory.mockReturnValue(of(expenseByCategory))
			mockStatistics.getDailyTotals.mockReturnValue(of(dailyTotals))

			service.loadStatistics()

			expect(service.error()).toBe('Failed to load statistics')
		})
		it('should clear previous error before a new request', () => {
			// simulate a previous error already on the signal
			service.error.set('Previous error')
			setupHappyPath()

			// switchMap calls error.set(null) before forkJoin starts
			service.loadStatistics()

			expect(service.error()).toBeNull()
		})
	})

	describe('computed signals', () => {
		describe('periodLabel()', () => {
			it('should return "last week" for WEEK', () => {
				service.period.set(PeriodType.WEEK)
				expect(service.periodLabel()).toBe('last week')
			})
			it('should return "last month" for MONTH', () => {
				service.period.set(PeriodType.MONTH)
				expect(service.periodLabel()).toBe('last month')
			})
			it('should return "last year" for YEAR', () => {
				service.period.set(PeriodType.YEAR)
				expect(service.periodLabel()).toBe('last year')
			})
		})

		describe('hasData()', () => {
			it('should be false when overview is null', () => {
				// overview starts null — no loadStatistics() call needed
				expect(service.hasData()).toBe(false)
			})
			it('should be false when transactionCount is 0', () => {
				service.overview.set({ ...overview, transactionCount: 0 })
				expect(service.hasData()).toBe(false)
			})
			it('should be true when overview has transactionCount > 0', () => {
				service.overview.set(overview)
				expect(service.hasData()).toBe(true)
			})
		})

		describe('expenseCategories()', () => {
			it('should return [] when expenseByCategory is null', () => {
				expect(service.expenseCategories()).toEqual([])
			})
			it('should return the categories array from expenseByCategory', () => {
				const category: CategoryBreakdownItem = {
					categoryId: 'c-1',
					categoryTitle: 'Food',
					categoryIcon: 'utensils',
					total: 200,
					percentage: 40,
					transactionCount: 3,
				}
				service.expenseByCategory.set({
					...expenseByCategory,
					categories: [category],
				})

				expect(service.expenseCategories()).toEqual([category])
			})
		})

		describe('incomeCategories()', () => {
			it('should return [] when incomeByCategory is null', () => {
				expect(service.incomeCategories()).toEqual([])
			})
			it('should return the categories array from incomeByCategory', () => {
				const category: CategoryBreakdownItem = {
					categoryId: 'c-2',
					categoryTitle: 'Salary',
					categoryIcon: 'briefcase',
					total: 1000,
					percentage: 100,
					transactionCount: 1,
				}
				service.incomeByCategory.set({
					...incomeByCategory,
					categories: [category],
				})

				expect(service.incomeCategories()).toEqual([category])
			})
		})
	})
})
