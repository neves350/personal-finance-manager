import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockMail } from 'src/__mocks__/mail.mock'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
	let service: NotificationService

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NotificationService,
				{ provide: PrismaService, useValue: mockPrisma },
				{ provide: MailService, useValue: mockMail },
			],
		}).compile()

		service = module.get<NotificationService>(NotificationService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('findAll', () => {
		it('should return paginated notifications', async () => {
			mockPrisma.notification.count.mockResolvedValue(2)
			mockPrisma.notification.findMany.mockResolvedValue([
				{ id: 'n1' },
				{ id: 'n2' },
			])

			const result = await service.findAll('user-1', {
				page: 1,
				limit: 20,
			})

			expect(result.data).toHaveLength(2)
			expect(result.meta.total).toBe(2)
			expect(result.meta.currentPage).toBe(1)
		})

		it('should calculate pagination meta correctly', async () => {
			mockPrisma.notification.count.mockResolvedValue(45)
			mockPrisma.notification.findMany.mockResolvedValue([])

			const result = await service.findAll('user-1', {
				page: 2,
				limit: 10,
			})

			expect(result.meta).toEqual({
				total: 45,
				lastPage: 5,
				currentPage: 2,
				perPage: 10,
				prev: 1,
				next: 3,
			})
		})
	})

	describe('getUnreadCount', () => {
		it('should return count of unread notifications', async () => {
			mockPrisma.notification.count.mockResolvedValue(5)

			const result = await service.getUnreadCount('user-1')

			expect(result).toEqual({ count: 5 })
			expect(mockPrisma.notification.count).toHaveBeenCalledWith({
				where: { userId: 'user-1', isRead: false },
			})
		})
	})

	describe('markAsRead', () => {
		it('should mark a notification as read', async () => {
			mockPrisma.notification.findFirst.mockResolvedValue({
				id: 'n1',
				userId: 'user-1',
			})
			mockPrisma.notification.update.mockResolvedValue({})

			await service.markAsRead('n1', 'user-1')

			expect(mockPrisma.notification.update).toHaveBeenCalledWith({
				where: { id: 'n1' },
				data: { isRead: true },
			})
		})

		it('should throw if notification not found', async () => {
			mockPrisma.notification.findFirst.mockResolvedValue(null)

			await expect(service.markAsRead('invalid', 'user-1')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('markAllAsRead', () => {
		it('should mark all unread notifications as read', async () => {
			mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 })

			await service.markAllAsRead('user-1')

			expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
				where: { userId: 'user-1', isRead: false },
				data: { isRead: true },
			})
		})
	})

	describe('delete', () => {
		it('should delete a notification owned by the user', async () => {
			mockPrisma.notification.findFirst.mockResolvedValue({
				id: 'n1',
				userId: 'user-1',
			})
			mockPrisma.notification.delete.mockResolvedValue({})

			await service.delete('n1', 'user-1')

			expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith({
				where: { id: 'n1', userId: 'user-1' },
			})
			expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
				where: { id: 'n1' },
			})
		})

		it('should throw if notification not found', async () => {
			mockPrisma.notification.findFirst.mockResolvedValue(null)

			await expect(service.delete('invalid', 'user-1')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('findAll filtering', () => {
		it('should filter by isRead when provided', async () => {
			mockPrisma.notification.count.mockResolvedValue(0)
			mockPrisma.notification.findMany.mockResolvedValue([])

			await service.findAll('user-1', {
				page: 1,
				limit: 20,
				isRead: false,
			})

			expect(mockPrisma.notification.count).toHaveBeenCalledWith({
				where: { userId: 'user-1', isRead: false },
			})
			expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { userId: 'user-1', isRead: false },
				}),
			)
		})

		it('should filter by search when provided', async () => {
			mockPrisma.notification.count.mockResolvedValue(0)
			mockPrisma.notification.findMany.mockResolvedValue([])

			await service.findAll('user-1', {
				page: 1,
				limit: 20,
				search: 'budget',
			})

			expect(mockPrisma.notification.count).toHaveBeenCalledWith({
				where: {
					userId: 'user-1',
					OR: [
						{ title: { contains: 'budget', mode: 'insensitive' } },
						{ message: { contains: 'budget', mode: 'insensitive' } },
					],
				},
			})
		})

		it('should combine isRead and search filters', async () => {
			mockPrisma.notification.count.mockResolvedValue(0)
			mockPrisma.notification.findMany.mockResolvedValue([])

			await service.findAll('user-1', {
				page: 1,
				limit: 20,
				isRead: true,
				search: 'goal',
			})

			expect(mockPrisma.notification.count).toHaveBeenCalledWith({
				where: {
					userId: 'user-1',
					isRead: true,
					OR: [
						{ title: { contains: 'goal', mode: 'insensitive' } },
						{ message: { contains: 'goal', mode: 'insensitive' } },
					],
				},
			})
		})
	})

	describe('createNotification', () => {
		it('should create a notification with current year/month', async () => {
			const created = { id: 'n1', userId: 'user-1' }
			mockPrisma.notification.create.mockResolvedValue(created)

			const result = await service.createNotification({
				userId: 'user-1',
				type: 'BUDGET_EXCEEDED' as any,
				title: 'Test',
				message: 'Test message',
				entityType: 'ENVELOPE',
				entityId: 'env-1',
			})

			expect(result).toEqual(created)
			expect(mockPrisma.notification.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					userId: 'user-1',
					year: expect.any(Number),
					month: expect.any(Number),
				}),
			})
		})

		it('should return null on duplicate (P2002)', async () => {
			const error = new PrismaClientKnownRequestError('Unique constraint', {
				code: 'P2002',
				clientVersion: '5.0.0',
			})
			mockPrisma.notification.create.mockRejectedValue(error)

			const result = await service.createNotification({
				userId: 'user-1',
				type: 'BUDGET_EXCEEDED' as any,
				title: 'Test',
				message: 'Test',
				entityType: 'ENVELOPE',
				entityId: 'env-1',
			})

			expect(result).toBeNull()
		})

		it('should rethrow non-P2002 errors', async () => {
			mockPrisma.notification.create.mockRejectedValue(new Error('DB error'))

			await expect(
				service.createNotification({
					userId: 'user-1',
					type: 'BUDGET_EXCEEDED' as any,
					title: 'Test',
					message: 'Test',
					entityType: 'ENVELOPE',
					entityId: 'env-1',
				}),
			).rejects.toThrow('DB error')
		})
	})

	describe('checkBudgetThresholds', () => {
		const userId = 'user-1'
		const txDate = new Date('2026-06-15')

		it('should return early if no budget exists', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue(null)

			await service.checkBudgetThresholds(userId, txDate)

			expect(mockPrisma.transaction.groupBy).not.toHaveBeenCalled()
		})

		it('should create BUDGET_EXCEEDED when progress >= 100%', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				envelopes: [
					{
						id: 'env-1',
						categoryId: 'cat-1',
						allocatedAmount: '100',
						category: { title: 'Food' },
					},
				],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'cat-1', _sum: { amount: '120' } },
			])
			mockPrisma.user.findUnique.mockResolvedValue({
				email: 'test@test.com',
				name: 'John',
			})
			mockPrisma.notification.create.mockResolvedValue({ id: 'n1' })

			await service.checkBudgetThresholds(userId, txDate)

			expect(mockPrisma.notification.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: 'BUDGET_EXCEEDED',
					entityType: 'ENVELOPE',
					entityId: 'env-1',
				}),
			})
			expect(mockMail.sendNotificationEmail).toHaveBeenCalled()
		})

		it('should create BUDGET_THRESHOLD_REACHED when progress >= 80%', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				envelopes: [
					{
						id: 'env-1',
						categoryId: 'cat-1',
						allocatedAmount: '100',
						category: { title: 'Food' },
					},
				],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'cat-1', _sum: { amount: '85' } },
			])
			mockPrisma.user.findUnique.mockResolvedValue({
				email: 'test@test.com',
				name: 'John',
			})
			mockPrisma.notification.create.mockResolvedValue({ id: 'n1' })

			await service.checkBudgetThresholds(userId, txDate)

			expect(mockPrisma.notification.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: 'BUDGET_THRESHOLD_REACHED',
					entityType: 'ENVELOPE',
					entityId: 'env-1',
				}),
			})
		})

		it('should not create notification when progress < 80%', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				envelopes: [
					{
						id: 'env-1',
						categoryId: 'cat-1',
						allocatedAmount: '100',
						category: { title: 'Food' },
					},
				],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'cat-1', _sum: { amount: '50' } },
			])
			mockPrisma.user.findUnique.mockResolvedValue({
				email: 'test@test.com',
				name: 'John',
			})

			await service.checkBudgetThresholds(userId, txDate)

			expect(mockPrisma.notification.create).not.toHaveBeenCalled()
		})

		it('should not send email when notification is deduped', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				envelopes: [
					{
						id: 'env-1',
						categoryId: 'cat-1',
						allocatedAmount: '100',
						category: { title: 'Food' },
					},
				],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'cat-1', _sum: { amount: '120' } },
			])
			mockPrisma.user.findUnique.mockResolvedValue({
				email: 'test@test.com',
				name: 'John',
			})
			const error = new PrismaClientKnownRequestError('Unique', {
				code: 'P2002',
				clientVersion: '5.0.0',
			})
			mockPrisma.notification.create.mockRejectedValue(error)

			await service.checkBudgetThresholds(userId, txDate)

			expect(mockMail.sendNotificationEmail).not.toHaveBeenCalled()
		})
	})

	describe('checkSpendingLimitGoals', () => {
		const userId = 'user-1'
		const categoryId = 'cat-1'
		const txDate = new Date('2026-06-15')

		it('should create GOAL_COMPLETED when spending limit reached', async () => {
			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-1',
					categoryId: 'cat-1',
					amount: '200',
					title: 'Entertainment Limit',
					startDate: new Date('2026-06-01'),
					endDate: new Date('2026-06-30'),
					user: { email: 'test@test.com', name: 'John' },
				},
			])
			mockPrisma.transaction.aggregate.mockResolvedValue({
				_sum: { amount: '250' },
			})
			mockPrisma.notification.create.mockResolvedValue({ id: 'n1' })

			await service.checkSpendingLimitGoals(userId, categoryId, txDate)

			expect(mockPrisma.notification.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: 'GOAL_COMPLETED',
					entityType: 'GOAL',
					entityId: 'goal-1',
				}),
			})
			expect(mockMail.sendNotificationEmail).toHaveBeenCalled()
		})

		it('should not create notification when under limit', async () => {
			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-1',
					categoryId: 'cat-1',
					amount: '200',
					title: 'Entertainment Limit',
					startDate: new Date('2026-06-01'),
					endDate: new Date('2026-06-30'),
					user: { email: 'test@test.com', name: 'John' },
				},
			])
			mockPrisma.transaction.aggregate.mockResolvedValue({
				_sum: { amount: '100' },
			})

			await service.checkSpendingLimitGoals(userId, categoryId, txDate)

			expect(mockPrisma.notification.create).not.toHaveBeenCalled()
		})

		it('should do nothing when no matching goals', async () => {
			mockPrisma.goal.findMany.mockResolvedValue([])

			await service.checkSpendingLimitGoals(userId, categoryId, txDate)

			expect(mockPrisma.transaction.aggregate).not.toHaveBeenCalled()
		})
	})

	describe('checkSavingsGoalCompletion', () => {
		it('should create GOAL_COMPLETED when target reached', async () => {
			mockPrisma.user.findUnique.mockResolvedValue({
				email: 'test@test.com',
				name: 'John',
			})
			mockPrisma.notification.create.mockResolvedValue({ id: 'n1' })

			await service.checkSavingsGoalCompletion(
				'user-1',
				'goal-1',
				500,
				500,
				'Vacation Fund',
			)

			expect(mockPrisma.notification.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					type: 'GOAL_COMPLETED',
					entityType: 'GOAL',
					entityId: 'goal-1',
				}),
			})
			expect(mockMail.sendNotificationEmail).toHaveBeenCalled()
		})

		it('should do nothing when current < target', async () => {
			await service.checkSavingsGoalCompletion(
				'user-1',
				'goal-1',
				300,
				500,
				'Vacation Fund',
			)

			expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
			expect(mockPrisma.notification.create).not.toHaveBeenCalled()
		})
	})
})
