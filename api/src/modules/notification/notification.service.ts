import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { NotificationType } from 'src/generated/prisma/enums'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { MailService } from 'src/infrastructure/mail/mail.service'
import { QueryNotificationDto } from './dtos/query-notification.dto'

interface CreateNotificationData {
	userId: string
	type: NotificationType
	title: string
	message: string
	entityType: string
	entityId: string
}

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly mailService: MailService,
	) {}

	async findAll(userId: string, dto: QueryNotificationDto) {
		const { page = 1, limit = 20, isRead, search } = dto

		const where: Record<string, unknown> = { userId }

		if (isRead !== undefined) {
			where.isRead = isRead
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ message: { contains: search, mode: 'insensitive' } },
			]
		}

		const total = await this.prisma.notification.count({ where })

		const data = await this.prisma.notification.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
			orderBy: { createdAt: 'desc' },
		})

		const lastPage = Math.ceil(total / limit)

		return {
			data,
			meta: {
				total,
				lastPage,
				currentPage: page,
				perPage: limit,
				prev: page > 1 ? page - 1 : null,
				next: page < lastPage ? page + 1 : null,
			},
		}
	}

	async getUnreadCount(userId: string) {
		const count = await this.prisma.notification.count({
			where: { userId, isRead: false },
		})
		return { count }
	}

	async markAsRead(id: string, userId: string) {
		const notification = await this.prisma.notification.findFirst({
			where: { id, userId },
		})

		if (!notification) throw new NotFoundException('Notification not found')

		await this.prisma.notification.update({
			where: { id },
			data: { isRead: true },
		})
	}

	async markAllAsRead(userId: string) {
		await this.prisma.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true },
		})
	}

	async delete(id: string, userId: string) {
		const notification = await this.prisma.notification.findFirst({
			where: { id, userId },
		})

		if (!notification) {
			throw new NotFoundException('Notification not found')
		}

		await this.prisma.notification.delete({ where: { id } })
	}

	async createNotification(data: CreateNotificationData) {
		const now = new Date()

		try {
			return await this.prisma.notification.create({
				data: {
					...data,
					year: now.getFullYear(),
					month: now.getMonth() + 1,
				},
			})
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				return null
			}
			throw error
		}
	}

	async checkBudgetThresholds(userId: string, transactionDate: Date) {
		const date = new Date(transactionDate)
		const month = date.getMonth() + 1
		const year = date.getFullYear()

		const budget = await this.prisma.budget.findUnique({
			where: { userId_month_year: { userId, month, year } },
			include: {
				envelopes: {
					include: {
						category: { select: { title: true } },
					},
				},
			},
		})

		if (!budget || budget.envelopes.length === 0) return

		const categoryIds = budget.envelopes.map((e) => e.categoryId)

		const startDate = new Date(year, month - 1, 1)
		const endDate = new Date(year, month, 0, 23, 59, 59, 999)

		const grouped = await this.prisma.transaction.groupBy({
			by: ['categoryId'],
			where: {
				bankAccount: { userId },
				date: { gte: startDate, lte: endDate },
				type: 'EXPENSE',
				categoryId: { in: categoryIds },
			},
			_sum: { amount: true },
		})

		const spentMap = new Map<string, number>()
		for (const item of grouped) {
			spentMap.set(item.categoryId, Number(item._sum.amount ?? 0))
		}

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, name: true },
		})

		for (const envelope of budget.envelopes) {
			const allocated = Number(envelope.allocatedAmount)
			if (allocated <= 0) continue

			const spent = spentMap.get(envelope.categoryId) ?? 0
			const progress = (spent / allocated) * 100
			const categoryName = envelope.category.title

			if (progress >= 100) {
				await this.createAndNotify(
					{
						userId,
						type: NotificationType.BUDGET_EXCEEDED,
						title: `Budget Exceeded: ${categoryName}`,
						message: `You've spent $${spent.toFixed(2)} of your $${allocated.toFixed(2)} ${categoryName} budget.`,
						entityType: 'ENVELOPE',
						entityId: envelope.id,
					},
					user,
				)
			} else if (progress >= 80) {
				await this.createAndNotify(
					{
						userId,
						type: NotificationType.BUDGET_THRESHOLD_REACHED,
						title: `Budget Warning: ${categoryName}`,
						message: `You've spent ${Math.round(progress)}% of your ${categoryName} budget ($${spent.toFixed(2)}/$${allocated.toFixed(2)}).`,
						entityType: 'ENVELOPE',
						entityId: envelope.id,
					},
					user,
				)
			}
		}
	}

	async checkSpendingLimitGoals(
		userId: string,
		categoryId: string,
		transactionDate: Date,
	) {
		const goals = await this.prisma.goal.findMany({
			where: {
				userId,
				categoryId,
				type: 'SPENDING_LIMIT',
				startDate: { lte: transactionDate },
				OR: [{ endDate: null }, { endDate: { gte: transactionDate } }],
			},
			include: {
				user: { select: { email: true, name: true } },
			},
		})

		for (const goal of goals) {
			const result = await this.prisma.transaction.aggregate({
				where: {
					category: { id: goal.categoryId!, userId },
					type: 'EXPENSE',
					date: {
						gte: goal.startDate,
						...(goal.endDate && { lte: goal.endDate }),
					},
				},
				_sum: { amount: true },
			})

			const spent = Number(result._sum.amount ?? 0)
			const limit = Number(goal.amount)

			if (spent >= limit) {
				await this.createAndNotify(
					{
						userId,
						type: NotificationType.GOAL_COMPLETED,
						title: `Spending Limit Reached: ${goal.title}`,
						message: `You've reached your spending limit of €${limit.toFixed(2)} for "${goal.title}".`,
						entityType: 'GOAL',
						entityId: goal.id,
					},
					goal.user,
				)
			}
		}
	}

	async checkSavingsGoalCompletion(
		userId: string,
		goalId: string,
		currentAmount: number,
		targetAmount: number,
		goalTitle: string,
	) {
		if (currentAmount < targetAmount) return

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, name: true },
		})

		await this.createAndNotify(
			{
				userId,
				type: NotificationType.GOAL_COMPLETED,
				title: `Goal Completed: ${goalTitle}`,
				message: `Congratulations! You've reached your target of €${targetAmount.toFixed(2)} for "${goalTitle}".`,
				entityType: 'GOAL',
				entityId: goalId,
			},
			user,
		)
	}

	private async createAndNotify(
		data: CreateNotificationData,
		user: { email: string; name: string } | null,
	) {
		const notification = await this.createNotification(data)
		if (notification && user) {
			await this.mailService
				.sendNotificationEmail(user.email, user.name, data.title, data.message)
				.catch((err) =>
					this.logger.error('Failed to send notification email', err),
				)
		}
	}
}
