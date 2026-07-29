import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'

@Injectable()
export class FindConnectionService {
	constructor(private readonly prisma: PrismaService) {}

	async findConnectionByUser(connectionId: string, userId: string) {
		const customer = await this.prisma.openBankingCustomer.findUnique({
			where: { userId },
		})

		if (!customer) {
			throw new NotFoundException('No Open Banking account found')
		}

		const connection = await this.prisma.openBankingConnection.findFirst({
			where: {
				id: connectionId,
				customerId: customer.id,
			},
			include: {
				accounts: {
					include: {
						bankAccount: {
							select: {
								id: true,
								name: true,
								balance: true,
								type: true,
							},
						},
					},
				},
			},
		})

		if (!connection) {
			throw new NotFoundException('Connection not found')
		}

		return connection
	}
}
