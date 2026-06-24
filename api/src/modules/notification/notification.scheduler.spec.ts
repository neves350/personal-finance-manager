import { Test, TestingModule } from '@nestjs/testing'
import { mockMail } from 'src/__mocks__/mail.mock'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { NotificationService } from './notification.service'
import { NotificationScheduler } from './notification.scheduler'

const mockNotificationService = {
	createNotification: jest.fn(),
}

describe('NotificationScheduler', () => {
	let scheduler: NotificationScheduler

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NotificationScheduler,
				{ provide: PrismaService, useValue: mockPrisma },
				{
					provide: NotificationService,
					useValue: mockNotificationService,
				},
				{ provide: MailService, useValue: mockMail },
			],
		}).compile()

		scheduler = module.get<NotificationScheduler>(NotificationScheduler)
	})

	it('should be defined', () => {
		expect(scheduler).toBeDefined()
	})

	describe('generateRecurringIncomeNotifications', () => {
		it('should create notifications for upcoming recurring income', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 3)
			const targetDay = targetDate.getDate()

			mockPrisma.recurring.findMany.mockResolvedValue([
				{
					id: 'rec-1',
					description: 'Salary',
					amount: '3000',
					frequency: 'MONTHLY',
					monthDay: targetDay,
					startDate: new Date('2026-01-01'),
					bankAccount: {
						user: {
							id: 'user-1',
							email: 'test@test.com',
							name: 'John',
						},
					},
				},
			])
			mockNotificationService.createNotification.mockResolvedValue({
				id: 'n1',
			})

			await scheduler.generateRecurringIncomeNotifications()

			expect(
				mockNotificationService.createNotification,
			).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
					type: 'RECURRING_INCOME_EXPECTED',
					entityType: 'RECURRING',
					entityId: 'rec-1',
				}),
			)
			expect(mockMail.sendNotificationEmail).toHaveBeenCalledWith(
				'test@test.com',
				'John',
				'Recurring Income Expected',
				expect.stringContaining('Salary'),
			)
		})

		it('should skip annual recurrings in wrong month', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 3)
			const wrongMonth =
				targetDate.getMonth() === 0 ? 5 : targetDate.getMonth() - 1

			mockPrisma.recurring.findMany.mockResolvedValue([
				{
					id: 'rec-1',
					description: 'Annual Bonus',
					amount: '5000',
					frequency: 'ANNUAL',
					monthDay: targetDate.getDate(),
					startDate: new Date(2025, wrongMonth, 1),
					bankAccount: {
						user: {
							id: 'user-1',
							email: 'test@test.com',
							name: 'John',
						},
					},
				},
			])

			await scheduler.generateRecurringIncomeNotifications()

			expect(
				mockNotificationService.createNotification,
			).not.toHaveBeenCalled()
		})

		it('should not send email when notification is deduped', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 3)

			mockPrisma.recurring.findMany.mockResolvedValue([
				{
					id: 'rec-1',
					description: 'Salary',
					amount: '3000',
					frequency: 'MONTHLY',
					monthDay: targetDate.getDate(),
					startDate: new Date('2026-01-01'),
					bankAccount: {
						user: {
							id: 'user-1',
							email: 'test@test.com',
							name: 'John',
						},
					},
				},
			])
			mockNotificationService.createNotification.mockResolvedValue(null)

			await scheduler.generateRecurringIncomeNotifications()

			expect(mockMail.sendNotificationEmail).not.toHaveBeenCalled()
		})
	})

	describe('generateGoalDeadlineNotifications', () => {
		it('should create notifications for goals ending in 7 days', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 7)

			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-1',
					title: 'Vacation Fund',
					type: 'SAVINGS',
					amount: '1000',
					currentAmount: '600',
					categoryId: null,
					startDate: new Date('2026-01-01'),
					endDate: targetDate,
					userId: 'user-1',
					user: {
						id: 'user-1',
						email: 'test@test.com',
						name: 'John',
					},
				},
			])
			mockNotificationService.createNotification.mockResolvedValue({
				id: 'n1',
			})

			await scheduler.generateGoalDeadlineNotifications()

			expect(
				mockNotificationService.createNotification,
			).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'user-1',
					type: 'GOAL_DEADLINE_APPROACHING',
					entityType: 'GOAL',
					entityId: 'goal-1',
				}),
			)
			expect(mockMail.sendNotificationEmail).toHaveBeenCalled()
		})

		it('should skip already completed goals', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 7)

			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-1',
					title: 'Completed Goal',
					type: 'SAVINGS',
					amount: '500',
					currentAmount: '500',
					categoryId: null,
					startDate: new Date('2026-01-01'),
					endDate: targetDate,
					userId: 'user-1',
					user: {
						id: 'user-1',
						email: 'test@test.com',
						name: 'John',
					},
				},
			])

			await scheduler.generateGoalDeadlineNotifications()

			expect(
				mockNotificationService.createNotification,
			).not.toHaveBeenCalled()
		})

		it('should aggregate spending for SPENDING_LIMIT goals', async () => {
			const targetDate = new Date()
			targetDate.setDate(targetDate.getDate() + 7)

			mockPrisma.goal.findMany.mockResolvedValue([
				{
					id: 'goal-1',
					title: 'Food Limit',
					type: 'SPENDING_LIMIT',
					amount: '300',
					currentAmount: '0',
					categoryId: 'cat-1',
					startDate: new Date('2026-06-01'),
					endDate: targetDate,
					userId: 'user-1',
					user: {
						id: 'user-1',
						email: 'test@test.com',
						name: 'John',
					},
				},
			])
			mockPrisma.transaction.aggregate.mockResolvedValue({
				_sum: { amount: '150' },
			})
			mockNotificationService.createNotification.mockResolvedValue({
				id: 'n1',
			})

			await scheduler.generateGoalDeadlineNotifications()

			expect(mockPrisma.transaction.aggregate).toHaveBeenCalled()
			expect(
				mockNotificationService.createNotification,
			).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'GOAL_DEADLINE_APPROACHING',
				}),
			)
		})
	})

	describe('cleanupOldNotifications', () => {
		it('should delete notifications older than 90 days', async () => {
			mockPrisma.notification.deleteMany.mockResolvedValue({ count: 5 })

			await scheduler.cleanupOldNotifications()

			expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
				where: {
					createdAt: { lt: expect.any(Date) },
				},
			})
		})

		it('should handle zero deleted notifications', async () => {
			mockPrisma.notification.deleteMany.mockResolvedValue({ count: 0 })

			await scheduler.cleanupOldNotifications()

			expect(mockPrisma.notification.deleteMany).toHaveBeenCalled()
		})
	})
})
