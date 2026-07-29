import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { GoalService } from './goal.service'
import { HeatmapService } from './helpers/heatmap.helper'
import { SavingsService } from './helpers/savings.helper'
import { SpendingLimitService } from './helpers/spending-limit.helper'

const mockNotificationService = {
	checkSavingsGoalCompletion: jest.fn().mockResolvedValue(undefined),
}

describe('GoalService', () => {
	let service: GoalService

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GoalService,
				{ provide: PrismaService, useValue: mockPrisma },
				{
					provide: NotificationService,
					useValue: mockNotificationService,
				},
				SpendingLimitService,
				SavingsService,
				HeatmapService,
			],
		}).compile()

		service = module.get<GoalService>(GoalService)
	})

	describe('create', () => {
		it('should create a goal', async () => {
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
			})
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})
			mockPrisma.goal.create.mockResolvedValue({
				title: 'Goal 1',
				type: 'SAVINGS',
				amount: 50,
				startDate: new Date('2026-03-10'),
				bankAccountId: 'account-id',
				categoryId: 'category-id',
				userId: 'user-id',
			})

			const result = await service.create('user-id', {
				title: 'Goal 1',
				type: 'SAVINGS',
				amount: 50,
				startDate: new Date('2026-03-10'),
				bankAccountId: 'account-id',
				categoryId: 'category-id',
			})

			expect(result).toHaveProperty('amount')
			expect(result).toHaveProperty('currentAmount')
		})
		it('should throw if category not found', async () => {
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(
				service.create('user-id', {
					title: 'Goal 1',
					type: 'SAVINGS',
					amount: 50,
					startDate: new Date('2026-03-10'),
					categoryId: 'category-id',
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if account not found', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.create('user-id', {
					title: 'Goal 1',
					type: 'SAVINGS',
					amount: 50,
					startDate: new Date('2026-03-10'),
					bankAccountId: 'account-id',
				}),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should return all goals', async () => {
			// findMany returns an array — Promise.all maps over it internally
			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-id',
					type: 'SAVINGS', // SAVINGS skips transaction.aggregate
					amount: '100',
					currentAmount: '0',
					startDate: new Date('2026-01-01'),
					endDate: new Date('2026-12-31'),
					categoryId: null,
					userId: 'user-id',
				},
			])

			const result = await service.findAll('user-id')

			// result is an array — check the first item
			expect(result[0]).toHaveProperty('amount')
			expect(result[0]).toHaveProperty('currentAmount')
		})
	})

	describe('findOne', () => {
		it('should return a goal', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				type: 'SAVINGS',
				amount: '100',
				currentAmount: '50',
				startDate: new Date('2026-01-01'),
				endDate: new Date('2026-12-31'),
				categoryId: null,
				deposits: [],
				userId: 'user-id',
			})

			const result = await service.findOne('user-id', 'goal-id')

			expect(result).toHaveProperty('id')
			expect(result).toHaveProperty('heatmap')
		})
		it('should throw if goal not found', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue(null)

			await expect(service.findOne('user-id', 'invalid-id')).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('update', () => {
		it('should update a goal', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				userId: 'user-id',
			})
			mockPrisma.goal.update.mockResolvedValue({
				id: 'goal-id',
				title: 'Goal 1',
				type: 'SAVINGS',
				amount: 50,
				startDate: new Date('2026-03-10'),
				bankAccountId: 'account-id',
				categoryId: 'category-id',
				userId: 'user-id',
			})

			const result = await service.update('user-id', 'goal-id', {
				title: 'Goal 1',
			})

			expect(result).toHaveProperty('id')
		})
		it('should throw if goal not found', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue(null)

			await expect(
				service.update('user-id', 'invalid-id', { title: 'Goal 1' }),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('delete', () => {
		it('should delete a goal', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				userId: 'user-id',
			})
			mockPrisma.goal.delete.mockResolvedValue({
				id: 'goal-id',
			})

			const result = await service.delete('user-id', 'goal-id')

			expect(result).toHaveProperty('id')
			expect(result).toHaveProperty('message')
		})
		it('should throw if goal not found', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue(null)

			await expect(service.delete('user-id', 'invalid-id')).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('addDeposit', () => {
		it('should add a goal depoist', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				type: 'SAVINGS',
				currentAmount: '0',
				amount: '100',
				userId: 'user-id',
			})
			mockPrisma.$transaction.mockResolvedValue([
				{ id: 'deposit-id', amount: '10', goalId: 'goal-id' },
				{
					id: 'goal-id',
					amount: '100',
					currentAmount: '10',
					startDate: new Date('2026-01-01'),
					endDate: new Date('2026-12-31'),
				},
			])

			const result = await service.addDeposit('user-id', 'goal-id', {
				amount: 10,
			})

			expect(result).toHaveProperty('deposit')
			expect(result).toHaveProperty('goal')
			expect(result).toHaveProperty('message')
		})
		it('should throw if goal not found', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue(null)

			await expect(
				service.addDeposit('user-id', 'invalid-id', { amount: 20 }),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if goal already completed', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				type: 'SAVINGS',
				currentAmount: '100',
				amount: '100',
				userId: 'user-id',
			})

			await expect(
				service.addDeposit('user-id', 'goal-id', { amount: 10 }),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('addDeposit notification hook', () => {
		it('should fire notification check when goal is completed', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				type: 'SAVINGS',
				currentAmount: '90',
				amount: '100',
				userId: 'user-id',
			})
			mockPrisma.$transaction.mockResolvedValue([
				{ id: 'deposit-id', amount: '10', goalId: 'goal-id' },
				{
					id: 'goal-id',
					title: 'My Goal',
					amount: '100',
					currentAmount: '100',
					startDate: new Date('2026-01-01'),
					endDate: new Date('2026-12-31'),
				},
			])

			await service.addDeposit('user-id', 'goal-id', { amount: 10 })

			expect(
				mockNotificationService.checkSavingsGoalCompletion,
			).toHaveBeenCalledWith('user-id', 'goal-id', 100, 100, 'My Goal')
		})

		it('should not fire notification check when goal is not completed', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				type: 'SAVINGS',
				currentAmount: '0',
				amount: '100',
				userId: 'user-id',
			})
			mockPrisma.$transaction.mockResolvedValue([
				{ id: 'deposit-id', amount: '10', goalId: 'goal-id' },
				{
					id: 'goal-id',
					title: 'My Goal',
					amount: '100',
					currentAmount: '10',
					startDate: new Date('2026-01-01'),
					endDate: new Date('2026-12-31'),
				},
			])

			await service.addDeposit('user-id', 'goal-id', { amount: 10 })

			expect(
				mockNotificationService.checkSavingsGoalCompletion,
			).not.toHaveBeenCalled()
		})
	})

	describe('getDeposits', () => {
		it('should return all deposits', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue({
				id: 'goal-id',
				userId: 'user-id',
			})
			mockPrisma.deposit.findMany.mockResolvedValue([
				{ id: 'deposit-id', amount: '10', goalId: 'goal-id' },
			])

			const result = await service.getDeposits('user-id', 'goal-id')

			expect(result).toHaveProperty('goalId')
			expect(result.totalDeposits).toBe(1)
			expect(result.totalAmount).toBe(10)
			expect(result.deposits).toHaveLength(1)
		})
		it('should throw if goal not found', async () => {
			mockPrisma.goal.findFirst.mockResolvedValue(null)

			await expect(
				service.getDeposits('user-id', 'invalid-id'),
			).rejects.toThrow(BadRequestException)
		})
	})
})
