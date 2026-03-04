import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateCardDto } from './dtos/create-card.dto'
import { UpdateCardDto } from './dtos/update-card.dto'

@Injectable()
export class CardService {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateCardDto, userId: string) {
		const {
			name,
			color,
			type,
			lastFour,
			expirationDate,
			cvc,
			creditLimit,
			closingDay,
			dueDay,
			bankAccountId,
		} = data

		// Validate that the bank account belongs to the user
		const bankAccount = await this.prisma.bankAccount.findFirst({
			where: {
				id: bankAccountId,
				userId,
			},
		})

		if (!bankAccount) {
			throw new BadRequestException('Bank account not found or unauthorized')
		}

		const card = await this.prisma.card.create({
			data: {
				name,
				color,
				type,
				lastFour,
				expirationDate,
				cvc,
				creditLimit,
				closingDay,
				dueDay,
				userId,
				bankAccountId,
			},
		})

		return card
	}

	async findAll(userId: string, bankAccountId?: string) {
		const cards = await this.prisma.card.findMany({
			where: {
				userId,
				...(bankAccountId && { bankAccountId }),
			},
		})

		return {
			cards,
			total: cards.length,
		}
	}

	async findOne(cardId: string, userId: string) {
		const card = await this.prisma.card.findFirst({
			where: {
				id: cardId,
				userId,
			},
		})

		if (!card) throw new NotFoundException('Card not found')

		return card
	}

	async updateById(cardId: string, userId: string, data: UpdateCardDto) {
		// check if card is own userId
		const card = await this.prisma.card.findFirst({
			where: {
				id: cardId,
				userId,
			},
		})

		if (!card) throw new NotFoundException('Card not found')

		// update card
		const updatedCard = await this.prisma.card.update({
			where: {
				id: cardId,
			},
			data,
		})

		return updatedCard
	}

	async delete(id: string) {
		await this.prisma.card.delete({
			where: { id },
		})

		return {
			message: 'Card deleted successfully',
			success: true,
		}
	}

	async monthlyExpenses(cardId: string, startMonth: string, endMonth: string) {
		const total = await this.prisma.transaction.aggregate({
			where: {
				cardId,
				type: 'EXPENSE',
				date: {
					gte: new Date(startMonth),
					lte: new Date(endMonth),
				},
			},
			_sum: {
				amount: true,
			},
		})

		return total
	}
}
