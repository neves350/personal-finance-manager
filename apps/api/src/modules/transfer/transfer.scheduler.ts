import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/infrastructure/db/prisma.service'

@Injectable()
export class TransferScheduler {
	private readonly logger = new Logger(TransferScheduler.name)

	constructor(private readonly prisma: PrismaService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async processScheduledTransfers() {
		const today = new Date()
		today.setHours(23, 59, 59, 999) // today = 23:59h

		// get pending transfers to the current date
		const pendingTransfers = await this.prisma.transfer.findMany({
			where: {
				status: 'PENDING',
				date: {
					lte: today,
				},
			},
		})

		this.logger.log(
			`Processing ${pendingTransfers.length} scheduled transfers.`,
		)

		for (const transfer of pendingTransfers) {
			try {
				await this.prisma.$transaction([
					this.prisma.transfer.update({
						where: {
							id: transfer.id,
						},
						data: {
							status: 'COMPLETED',
							executedAt: new Date(),
						},
					}),

					this.prisma.bankAccount.update({
						where: {
							id: transfer.fromAccountId,
						},
						data: {
							balance: {
								decrement: transfer.amount,
							},
						},
					}),

					this.prisma.bankAccount.update({
						where: {
							id: transfer.toAccountId,
						},
						data: {
							balance: {
								increment: transfer.amount,
							},
						},
					}),
				])
				this.logger.log(`Transfer ${transfer.id} completed.`)
			} catch (error) {
				this.logger.error(`Failed to process transfer ${transfer.id}`, error)
			}
		}
	}
}
