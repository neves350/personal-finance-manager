import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Prisma } from 'src/generated/prisma/client'
import { PrismaService } from 'src/infrastructure/db/prisma.service'

@Injectable()
export class RecurringScheduler {
	private readonly logger = new Logger(RecurringScheduler.name)

	constructor(private readonly prisma: PrismaService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async generateRecurringTransaction() {
		const today = new Date()
		const currentDay = today.getDate()
		const currentMonth = today.getMonth()

		this.logger.log(
			`Runing recurring transaction generation for day ${currentDay}`,
		)

		const recurrings = await this.prisma.recurring.findMany({
			where: {
				monthDay: currentDay,
				startDate: { lte: today },
				OR: [{ endDate: null }, { endDate: { gte: today } }],
			},
		})

		for (const recurring of recurrings) {
			try {
				// generate when currentMonth is the same of startDate
				if (recurring.frequency === 'ANNUAL') {
					if (currentMonth !== recurring.startDate.getMonth()) continue
				}

				// verify is was generate in this period
				const periodStart =
					recurring.frequency === 'MONTH'
						? new Date(today.getFullYear(), today.getMonth(), 1)
						: new Date(today.getFullYear(), 0, 1)

				if (
					recurring.lastGeneratedAt &&
					recurring.lastGeneratedAt >= periodStart
				)
					continue

				await this.prisma.$transaction(async (tx) => {
					const amount = new Prisma.Decimal(Number(recurring.amount))

					await tx.transaction.create({
						data: {
							title: recurring.description,
							type: recurring.type,
							amount,
							date: today,
							isPaid: true,
							recurring: { connect: { id: recurring.id } },
							bankAccount: { connect: { id: recurring.bankAccountId } },
							category: { connect: { id: recurring.categoryId } },
							...(recurring.cardId && {
								card: { connect: { id: recurring.cardId } },
							}),
						},
					})

					await tx.bankAccount.update({
						where: { id: recurring.bankAccountId },
						data: {
							balance: {
								increment:
									recurring.type === 'INCOME'
										? Number(amount)
										: -Number(amount),
							},
						},
					})

					await tx.recurring.update({
						where: { id: recurring.id },
						data: { lastGeneratedAt: today },
					})
				})

				this.logger.log(`Generated transaction for recurring ${recurring.id}`)
			} catch (error) {
				this.logger.error(`Failed for recurring ${recurring.id}`, error)
			}
		}
	}
}
