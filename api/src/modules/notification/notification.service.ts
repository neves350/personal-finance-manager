import { Injectable, NotFoundException } from '@nestjs/common'
import type { NotificationType } from 'src/generated/prisma/enums'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
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
	constructor(private readonly prisma: PrismaService) {}

	async findAll(userId: string, dto: QueryNotificationDto) {
		const { page = 1, limit = 20 } = dto

		const where = { userId }

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
}
