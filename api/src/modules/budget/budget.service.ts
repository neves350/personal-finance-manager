import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { Type } from 'src/generated/prisma/enums'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { NumberHelper } from '../statistic/helpers/number.helper'
import { CreateBudgetDto } from './dtos/create-budget.dto'
import { UpdateBudgetDto } from './dtos/update-budget.dto'

type EnvelopeStatus = 'on_track' | 'warning' | 'overspent'

@Injectable()
export class BudgetService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateBudgetDto, userId: string) {
		const { month, year, note } = dto

		try {
			const budget = await this.prisma.budget.create({
				data: {
					month,
					year,
					note,
					userId,
				},
			})

			return budget
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException(
					'A budget for this month and year already exists',
				)
			}
			throw error
		}
	}

	async update(userId: string, id: string, dto: UpdateBudgetDto) {
		const budget = await this.prisma.budget.findFirst({
			where: { id, userId },
		})

		if (!budget) throw new BadRequestException('Budget not found')

		return this.prisma.budget.update({
			where: { id },
			data: { note: dto.note },
		})
	}

	async delete(userId: string, id: string) {
		const budget = await this.prisma.budget.findFirst({
			where: { id, userId },
		})

		if (!budget) throw new BadRequestException('Budget not found')

		await this.prisma.budget.delete({
			where: { id },
		})

		return { message: 'Budget deleted successfully' }
	}

	async findAll(userId: string) {
		return this.prisma.budget.findMany({
			where: { userId },
			orderBy: [{ year: 'desc' }, { month: 'desc' }],
			select: {
				id: true,
				month: true,
				year: true,
				note: true,
				createdAt: true,
			},
		})
	}

	async findCurrent(userId: string) {
		const now = new Date()
		return this.findByMonthYear(userId, now.getMonth() + 1, now.getFullYear())
	}

	async findByMonthYear(userId: string, month: number, year: number) {
		const budget = await this.prisma.budget.findUnique({
			where: { userId_month_year: { userId, month, year } },
			include: {
				envelopes: {
					include: {
						category: {
							select: { id: true, title: true, icon: true, color: true, type: true },
						},
					},
				},
			},
		})

		if (!budget) {
			throw new NotFoundException('No budget found for this month and year')
		}

		const categoryIds = budget.envelopes.map((e) => e.categoryId)

		const spentMap =
			categoryIds.length > 0
				? await this.getSpentByCategory(userId, month, year, categoryIds)
				: new Map<string, number>()

		const envelopes = budget.envelopes.map((envelope) => {
			const allocatedAmount = NumberHelper.toNumber(envelope.allocatedAmount)
			const spentAmount = spentMap.get(envelope.categoryId) ?? 0
			const remainingAmount = NumberHelper.round(allocatedAmount - spentAmount)
			const progress =
				allocatedAmount > 0
					? NumberHelper.round((spentAmount / allocatedAmount) * 100)
					: 0

			let status: EnvelopeStatus = 'on_track'
			if (progress >= 100) status = 'overspent'
			else if (progress >= 80) status = 'warning'

			return {
				id: envelope.id,
				categoryId: envelope.categoryId,
				allocatedAmount,
				spentAmount,
				remainingAmount,
				progress,
				status,
				category: envelope.category,
			}
		})

		const summary = {
			totalAllocated: NumberHelper.round(
				envelopes.reduce((sum, e) => sum + e.allocatedAmount, 0),
			),
			totalSpent: NumberHelper.round(
				envelopes.reduce((sum, e) => sum + e.spentAmount, 0),
			),
			totalRemaining: NumberHelper.round(
				envelopes.reduce((sum, e) => sum + e.remainingAmount, 0),
			),
			envelopeCount: envelopes.length,
			overspentCount: envelopes.filter((e) => e.status === 'overspent').length,
			warningCount: envelopes.filter((e) => e.status === 'warning').length,
		}

		return {
			id: budget.id,
			userId: budget.userId,
			month: budget.month,
			year: budget.year,
			note: budget.note,
			createdAt: budget.createdAt,
			updatedAt: budget.updatedAt,
			envelopes,
			summary,
		}
	}

	private async getSpentByCategory(
		userId: string,
		month: number,
		year: number,
		categoryIds: string[],
	): Promise<Map<string, number>> {
		const startDate = new Date(year, month - 1, 1)
		const endDate = new Date(year, month, 0, 23, 59, 59, 999)

		const grouped = await this.prisma.transaction.groupBy({
			by: ['categoryId'],
			where: {
				bankAccount: { userId },
				date: { gte: startDate, lte: endDate },
				type: Type.EXPENSE,
				categoryId: { in: categoryIds },
			},
			_sum: { amount: true },
		})

		const map = new Map<string, number>()
		for (const item of grouped) {
			map.set(item.categoryId, NumberHelper.toNumber(item._sum.amount))
		}
		return map
	}
}
