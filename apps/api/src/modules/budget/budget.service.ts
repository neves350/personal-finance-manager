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
import { CreateEnvelopeDto } from './dtos/create-envelope.dto'
import { TransferEnvelopeDto } from './dtos/transfer-envelope.dto'
import { UpdateBudgetDto } from './dtos/update-budget.dto'
import { UpdateEnvelopeDto } from './dtos/update-envelope.dto'

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
							select: {
								id: true,
								title: true,
								icon: true,
								color: true,
								type: true,
							},
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

	async addEnvelope(userId: string, budgetId: string, dto: CreateEnvelopeDto) {
		const budget = await this.prisma.budget.findFirst({
			where: { id: budgetId, userId },
		})

		if (!budget) throw new BadRequestException('Budget not found')

		const category = await this.prisma.category.findFirst({
			where: { id: dto.categoryId, userId },
		})

		if (!category) throw new BadRequestException('Category not found')

		if (category.type !== Type.EXPENSE) {
			throw new BadRequestException(
				'Only expense categories can be used as envelopes',
			)
		}

		try {
			return await this.prisma.envelope.create({
				data: {
					budgetId,
					categoryId: dto.categoryId,
					allocatedAmount: dto.allocatedAmount,
				},
				include: {
					category: {
						select: {
							id: true,
							title: true,
							icon: true,
							color: true,
							type: true,
						},
					},
				},
			})
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException(
					'This category already has an envelope in this budget',
				)
			}
			throw error
		}
	}

	async updateEnvelope(
		userId: string,
		budgetId: string,
		envelopeId: string,
		dto: UpdateEnvelopeDto,
	) {
		const envelope = await this.prisma.envelope.findFirst({
			where: { id: envelopeId, budget: { id: budgetId, userId } },
		})

		if (!envelope) throw new BadRequestException('Envelope not found')

		return this.prisma.envelope.update({
			where: { id: envelopeId },
			data: { allocatedAmount: dto.allocatedAmount },
			include: {
				category: {
					select: {
						id: true,
						title: true,
						icon: true,
						color: true,
						type: true,
					},
				},
			},
		})
	}

	async removeEnvelope(userId: string, budgetId: string, envelopeId: string) {
		const envelope = await this.prisma.envelope.findFirst({
			where: { id: envelopeId, budget: { id: budgetId, userId } },
		})

		if (!envelope) throw new BadRequestException('Envelope not found')

		await this.prisma.envelope.delete({
			where: { id: envelopeId },
		})

		return { message: 'Envelope removed successfully' }
	}

	async transferBetweenEnvelopes(
		userId: string,
		budgetId: string,
		dto: TransferEnvelopeDto,
	) {
		if (dto.fromEnvelopeId === dto.toEnvelopeId) {
			throw new BadRequestException('Cannot transfer to the same envelope')
		}

		const [source, target] = await Promise.all([
			this.prisma.envelope.findFirst({
				where: { id: dto.fromEnvelopeId, budget: { id: budgetId, userId } },
			}),
			this.prisma.envelope.findFirst({
				where: { id: dto.toEnvelopeId, budget: { id: budgetId, userId } },
			}),
		])

		if (!source) throw new BadRequestException('Source envelope not found')
		if (!target) throw new BadRequestException('Target envelope not found')

		const sourceAmount = NumberHelper.toNumber(source.allocatedAmount)
		if (dto.amount > sourceAmount) {
			throw new BadRequestException(
				'Transfer amount exceeds source envelope allocation',
			)
		}

		const [updatedSource, updatedTarget] = await this.prisma.$transaction([
			this.prisma.envelope.update({
				where: { id: dto.fromEnvelopeId },
				data: { allocatedAmount: { decrement: dto.amount } },
				include: {
					category: {
						select: {
							id: true,
							title: true,
							icon: true,
							color: true,
							type: true,
						},
					},
				},
			}),
			this.prisma.envelope.update({
				where: { id: dto.toEnvelopeId },
				data: { allocatedAmount: { increment: dto.amount } },
				include: {
					category: {
						select: {
							id: true,
							title: true,
							icon: true,
							color: true,
							type: true,
						},
					},
				},
			}),
		])

		return {
			from: updatedSource,
			to: updatedTarget,
		}
	}

	async copyFromPrevious(userId: string, budgetId: string) {
		const budget = await this.prisma.budget.findFirst({
			where: { id: budgetId, userId },
			include: { envelopes: true },
		})

		if (!budget) throw new BadRequestException('Budget not found')

		if (budget.envelopes.length > 0) {
			throw new BadRequestException(
				'Budget already has envelopes. Remove them before copying.',
			)
		}

		const prevMonth = budget.month === 1 ? 12 : budget.month - 1
		const prevYear = budget.month === 1 ? budget.year - 1 : budget.year

		const previousBudget = await this.prisma.budget.findUnique({
			where: {
				userId_month_year: { userId, month: prevMonth, year: prevYear },
			},
			include: { envelopes: true },
		})

		if (!previousBudget) {
			throw new NotFoundException('No budget found for the previous month')
		}

		if (previousBudget.envelopes.length === 0) {
			throw new BadRequestException(
				'Previous month budget has no envelopes to copy',
			)
		}

		await this.prisma.envelope.createMany({
			data: previousBudget.envelopes.map((e) => ({
				budgetId,
				categoryId: e.categoryId,
				allocatedAmount: e.allocatedAmount,
			})),
		})

		return this.findByMonthYear(userId, budget.month, budget.year)
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
