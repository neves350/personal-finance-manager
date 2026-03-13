import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { QueryTransferDto } from './dtos/query-transfer.dto'
import { TransferDto } from './dtos/transfer.dto'

@Injectable()
export class TransferService {
	constructor(private readonly prisma: PrismaService) {}

	async transfer(userId: string, data: TransferDto) {
		const { amount, fromAccountId, toAccountId, date, description } = data

		// verify ownership
		const [fromAccount, toAccount] = await Promise.all([
			this.prisma.bankAccount.findFirst({
				where: {
					id: fromAccountId,
					userId,
				},
			}),
			this.prisma.bankAccount.findFirst({
				where: {
					id: toAccountId,
					userId,
				},
			}),
		])

		if (!fromAccount) throw new NotFoundException('Source account not found')

		if (!toAccount) throw new NotFoundException('Destination account not found')

		// check's for positive balance
		const fromBalance = Number(fromAccount.balance)
		if (fromBalance < amount)
			throw new BadRequestException(
				`Insufficient balance. Available: ${fromBalance}, Requested: ${amount}`,
			)

		// check's current day or future date
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const transferDate = new Date(date)
		transferDate.setHours(0, 0, 0, 0)

		const isScheduled = transferDate > today

		if (isScheduled) {
			// pending status
			const transfer = await this.prisma.transfer.create({
				data: {
					amount,
					fromAccountId,
					toAccountId,
					date,
					description,
					userId,
					status: 'PENDING',
				},
			})
			return {
				transfer,
				message: 'Transfer scheduled successfully.',
			}
		}

		// completed status
		const [transfer] = await this.prisma.$transaction([
			this.prisma.transfer.create({
				data: {
					amount,
					fromAccountId,
					toAccountId,
					date,
					description,
					userId,
					status: 'COMPLETED',
					executedAt: new Date(),
				},
			}),
			this.prisma.bankAccount.update({
				where: {
					id: fromAccountId,
				},
				data: {
					balance: {
						decrement: amount,
					},
				},
			}),
			this.prisma.bankAccount.update({
				where: {
					id: toAccountId,
				},
				data: {
					balance: {
						increment: amount,
					},
				},
			}),
		])

		return {
			transfer,
			message: 'Transfer completed successfully',
		}
	}

	async findAll(userId: string, query: QueryTransferDto) {
		const {
			accountId,
			startDate,
			endDate,
			status,
			offset = 0,
			limit = 10,
		} = query

		const where: any = { userId }

		// filter by account
		if (accountId) {
			where.OR = [
				{
					fromAccountId: accountId,
				},
				{
					toAccountId: accountId,
				},
			]
		}

		// filter by status
		if (status) where.status = status

		// filter by period
		if (startDate || endDate) {
			where.date = {}
			if (startDate) where.date.gte = startDate
			if (endDate) where.date.lte = endDate
		}

		const [transfers, count] = await Promise.all([
			this.prisma.transfer.findMany({
				where,
				orderBy: {
					date: 'desc',
				},
				take: limit,
				skip: offset,
				include: {
					fromAccount: {
						select: {
							id: true,
							name: true,
						},
					},
					toAccount: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			}),

			this.prisma.transfer.count({ where }),
		])

		return {
			data: transfers,
			count,
			limit,
			offset,
		}
	}

	async findOne(transferId: string, userId: string) {
		const transfer = await this.prisma.transfer.findUnique({
			where: {
				id: transferId,
				userId,
			},
		})

		if (!transfer) throw new NotFoundException('Transfer not found.')

		return transfer
	}
}
