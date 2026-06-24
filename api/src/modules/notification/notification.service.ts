import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { QueryNotificationDto } from './dtos/query-notification.dto'

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
}
