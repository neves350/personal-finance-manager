import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CategoryService } from './helpers/category.helper'
import { TransactionFiltersService } from './helpers/transaction-filters.helper'
import { TrendsService } from './helpers/trends.helper'
import { StatisticService } from './statistic.service'

describe('StatisticService', () => {
	let service: StatisticService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StatisticService,
				CategoryService,
				TrendsService,
				TransactionFiltersService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<StatisticService>(StatisticService)
	})

	describe('getOverview', () => {
		it('should return overview stats', async () => {
			mockPrisma.transaction.aggregate
				.mockResolvedValueOnce({
					_sum: { amount: 100 },
					_count: 2,
					_avg: { amount: 50 },
				})
				.mockResolvedValueOnce({
					_sum: { amount: 200 },
					_count: 3,
					_avg: { amount: 66 },
				})
			mockPrisma.transaction.groupBy.mockResolvedValue([])

			const result = await service.getOverview('user-id', {})

			expect(result).toHaveProperty('totalExpenses')
			expect(result).toHaveProperty('totalIncome')
		})
	})

	describe('getByCategory', () => {
		it('should return categories breakdown', async () => {
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'cat-id', _sum: { amount: 50 }, _count: 2 },
			])
			mockPrisma.category.findUnique.mockResolvedValue({
				title: 'Food',
				icon: 'utensils',
			})

			const result = await service.getByCategory('user-id', {})

			expect(result).toHaveProperty('categories')
			expect(result.categories).toHaveLength(1)
			expect(result.totalAmount).toBe(50)
		})
	})

	describe('getTrends', () => {
		it('should return trends', async () => {
			mockPrisma.transaction.aggregate.mockResolvedValue({
				_sum: { amount: 100 },
				_count: 2,
				_avg: { amount: 50 },
			})

			const result = await service.getTrends('user-id', {})

			expect(result).toHaveProperty('current')
			expect(result).toHaveProperty('previous')
			expect(result).toHaveProperty('change')
		})
	})

	describe('dailyTotals', () => {
		it('should return daily totals', async () => {
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{
					date: new Date('2026-03-01'),
					type: 'INCOME',
					_sum: { amount: 100 },
				},
			])

			const result = await service.dailyTotals('user-id', {
				startDate: '2026-03-01',
				endDate: '2026-03-01',
			})

			expect(result.labels).toHaveLength(1)
			expect(result.income[0]).toBe(100)
			expect(result.expenses[0]).toBe(0)
		})
	})
})
