import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { NotificationType } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { NotificationService } from './notification.service'

@Injectable()
export class NotificationScheduler {
	private readonly logger = new Logger(NotificationScheduler.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService,
		private readonly mailService: MailService,
	) {}

	@Cron('0 8 * * *')
	async generateRecurringIncomeNotifications() {
		this.logger.log('Running recurring income notification generation')

		const today = new Date()
		const targetDate = new Date(today)
		targetDate.setDate(today.getDate() + 3)

		const targetDay = targetDate.getDate()
		const targetMonth = targetDate.getMonth()

		const recurrings = await this.prisma.recurring.findMany({
			where: {
				type: 'INCOME',
				monthDay: targetDay,
				startDate: { lte: targetDate },
				OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
			},
			include: {
				bankAccount: {
					include: {
						user: { select: { id: true, email: true, name: true } },
					},
				},
			},
		})

		for (const recurring of recurrings) {
			try {
				if (
					recurring.frequency === 'ANNUAL' &&
					targetMonth !== recurring.startDate.getMonth()
				) {
					continue
				}

				const user = recurring.bankAccount.user
				const title = 'Recurring Income Expected'
				const message = `Your recurring income "${recurring.description}" of $${Number(recurring.amount)} is expected in 3 days.`

				const notification =
					await this.notificationService.createNotification({
						userId: user.id,
						type: NotificationType.RECURRING_INCOME_EXPECTED,
						title,
						message,
						entityType: 'RECURRING',
						entityId: recurring.id,
					})

				if (notification) {
					await this.mailService
						.sendNotificationEmail(
							user.email,
							user.name,
							title,
							message,
						)
						.catch((err) =>
							this.logger.error(
								`Failed to send email for recurring ${recurring.id}`,
								err,
							),
						)
				}
			} catch (error) {
				this.logger.error(
					`Failed for recurring ${recurring.id}`,
					error,
				)
			}
		}
	}

	@Cron('0 8 * * *')
	async generateGoalDeadlineNotifications() {
		this.logger.log('Running goal deadline notification generation')

		const today = new Date()
		const targetDate = new Date(today)
		targetDate.setDate(today.getDate() + 7)

		const startOfDay = new Date(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate(),
		)
		const endOfDay = new Date(
			targetDate.getFullYear(),
			targetDate.getMonth(),
			targetDate.getDate(),
			23,
			59,
			59,
			999,
		)

		const goals = await this.prisma.goal.findMany({
			where: {
				endDate: { gte: startOfDay, lte: endOfDay },
			},
			include: {
				user: { select: { id: true, email: true, name: true } },
			},
		})

		for (const goal of goals) {
			try {
				const targetAmount = Number(goal.amount)
				let currentAmount = Number(goal.currentAmount)

				if (goal.type === 'SPENDING_LIMIT' && goal.categoryId) {
					const result = await this.prisma.transaction.aggregate({
						where: {
							category: { id: goal.categoryId, userId: goal.userId },
							type: 'EXPENSE',
							date: {
								gte: goal.startDate,
								...(goal.endDate && { lte: goal.endDate }),
							},
						},
						_sum: { amount: true },
					})
					currentAmount = Number(result._sum.amount ?? 0)
				}

				if (currentAmount >= targetAmount) continue

				const progress =
					targetAmount > 0
						? Math.round((currentAmount / targetAmount) * 100)
						: 0

				const title = `Goal Deadline Approaching: ${goal.title}`
				const message = `Your goal "${goal.title}" ends in 7 days. Current progress: ${progress}%.`

				const notification =
					await this.notificationService.createNotification({
						userId: goal.userId,
						type: NotificationType.GOAL_DEADLINE_APPROACHING,
						title,
						message,
						entityType: 'GOAL',
						entityId: goal.id,
					})

				if (notification) {
					await this.mailService
						.sendNotificationEmail(
							goal.user.email,
							goal.user.name,
							title,
							message,
						)
						.catch((err) =>
							this.logger.error(
								`Failed to send email for goal ${goal.id}`,
								err,
							),
						)
				}
			} catch (error) {
				this.logger.error(`Failed for goal ${goal.id}`, error)
			}
		}
	}

	@Cron('0 3 * * *')
	async cleanupOldNotifications() {
		const cutoff = new Date()
		cutoff.setDate(cutoff.getDate() - 90)

		const { count } = await this.prisma.notification.deleteMany({
			where: { createdAt: { lt: cutoff } },
		})

		if (count > 0) {
			this.logger.log(`Cleaned up ${count} notifications older than 90 days`)
		}
	}
}
