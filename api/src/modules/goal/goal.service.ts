import { BadRequestException, Injectable } from '@nestjs/common'
import { GoalType } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { CreateDepositDto } from './dtos/create-deposit.dto'
import { CreateGoalDto } from './dtos/create-goal.dto'
import { UpdateGoalDto } from './dtos/update-goal.dto'
import { HeatmapService } from './helpers/heatmap.helper'
import { SavingsService } from './helpers/savings.helper'
import { SpendingLimitService } from './helpers/spending-limit.helper'

@Injectable()
export class GoalService {
	constructor(
		private readonly prisma: PrismaService,
		readonly spendingLimitService: SpendingLimitService,
		private readonly savingsService: SavingsService,
		private readonly heatmapService: HeatmapService,
		private readonly notificationService: NotificationService,
	) {}
	/**
	 * CREATE
	 */
	async create(userId: string, data: CreateGoalDto) {
		const {
			title,
			amount,
			startDate,
			type,
			bankAccountId,
			categoryId,
			endDate,
		} = data

		if (categoryId) {
			const category = await this.prisma.category.findFirst({
				where: { id: categoryId, userId },
			})
			if (!category) throw new BadRequestException('Category not found')
		}

		if (bankAccountId) {
			const account = await this.prisma.bankAccount.findFirst({
				where: { id: bankAccountId, userId },
			})
			if (!account) throw new BadRequestException('Bank account not found')
		}

		const goal = await this.prisma.goal.create({
			data: {
				title,
				amount,
				type,
				startDate,
				endDate,
				bankAccountId: bankAccountId || null,
				categoryId: categoryId || null,
				userId,
			},
			include: {
				category: true,
				bankAccount: true,
			},
		})

		const targetAmount = Number(goal.amount)

		const breakdown =
			goal.type === GoalType.SAVINGS
				? this.savingsService.calculateSavingsBreakdown(
						targetAmount,
						goal.endDate,
					)
				: this.spendingLimitService.calculateSpendingBreakdown(
						targetAmount,
						goal.endDate,
					)

		const paceStatus =
			goal.type === GoalType.SAVINGS
				? this.savingsService.calculatePaceStatus(
						0,
						targetAmount,
						goal.startDate,
						goal.endDate,
					)
				: this.spendingLimitService.calculatePaceStatus(
						0,
						targetAmount,
						goal.startDate,
						goal.endDate,
					)

		return {
			...goal,
			amount: targetAmount,
			currentAmount: 0,
			progress: 0,
			isCompleted: false,
			breakdown,
			paceStatus,
		}
	}

	/**
	 * FIND ALL
	 */
	async findAll(userId: string) {
		const goals = await this.prisma.goal.findMany({
			where: { userId },
			include: {
				category: true,
				bankAccount: true,
				_count: { select: { deposits: true } },
			},
			orderBy: { createdAt: 'desc' },
		})

		return Promise.all(
			goals.map(async (goal) => {
				const targetAmount = Number(goal.amount)
				let currentAmount = Number(goal.currentAmount)

				// For SPENDING_LIMIT: calculate from transactions
				if (goal.type === GoalType.SPENDING_LIMIT && goal.categoryId) {
					const result = await this.prisma.transaction.aggregate({
						where: {
							category: {
								id: goal.categoryId,
								userId,
							},
							type: 'EXPENSE',
							date: {
								gte: goal.startDate,
								...(goal.endDate && { lte: goal.endDate }),
							},
						},
						_sum: { amount: true },
					})
					currentAmount = Number(result._sum.amount ?? 0)
				}

				const progress =
					targetAmount > 0
						? Number(((currentAmount / targetAmount) * 100).toFixed(2))
						: 0
				const isCompleted = currentAmount >= targetAmount

				const breakdown =
					goal.type === GoalType.SAVINGS
						? this.savingsService.calculateSavingsBreakdown(
								targetAmount - currentAmount,
								goal.endDate,
							)
						: this.spendingLimitService.calculateSpendingBreakdown(
								targetAmount - currentAmount,
								goal.endDate,
							)

				const paceStatus =
					goal.type === GoalType.SAVINGS
						? this.savingsService.calculatePaceStatus(
								currentAmount,
								targetAmount,
								goal.startDate,
								goal.endDate,
							)
						: this.spendingLimitService.calculatePaceStatus(
								currentAmount,
								targetAmount,
								goal.startDate,
								goal.endDate,
							)

				return {
					...goal,
					amount: targetAmount,
					currentAmount,
					progress,
					isCompleted,
					breakdown,
					paceStatus,
				}
			}),
		)
	}

	/**
	 * FIND ONE
	 */
	async findOne(userId: string, id: string) {
		const goal = await this.prisma.goal.findFirst({
			where: { id, userId },
			include: {
				category: true,
				bankAccount: true,
				deposits: { orderBy: { date: 'desc' } },
			},
		})

		if (!goal) throw new BadRequestException('Goal not found')

		const targetAmount = Number(goal.amount)
		let currentAmount = Number(goal.currentAmount)

		if (goal.type === GoalType.SPENDING_LIMIT && goal.categoryId) {
			const result = await this.prisma.transaction.aggregate({
				where: {
					category: { id: goal.categoryId, userId },
					type: 'EXPENSE',
					date: {
						gte: goal.startDate,
						...(goal.endDate && { lte: goal.endDate }),
					},
				},
				_sum: { amount: true },
			})
			currentAmount = Number(result._sum.amount ?? 0)
		}

		const remainingAmount = targetAmount - currentAmount
		const progress =
			targetAmount > 0
				? Number(((currentAmount / targetAmount) * 100).toFixed(2))
				: 0

		const breakdown =
			goal.type === GoalType.SAVINGS
				? this.savingsService.calculateSavingsBreakdown(
						remainingAmount,
						goal.endDate,
					)
				: this.spendingLimitService.calculateSpendingBreakdown(
						remainingAmount,
						goal.endDate,
					)

		const paceStatus =
			goal.type === GoalType.SAVINGS
				? this.savingsService.calculatePaceStatus(
						currentAmount,
						targetAmount,
						goal.startDate,
						goal.endDate,
					)
				: this.spendingLimitService.calculatePaceStatus(
						currentAmount,
						targetAmount,
						goal.startDate,
						goal.endDate,
					)

		// Heatmap only for SAVINGS goals
		const heatmap =
			goal.type === GoalType.SAVINGS
				? this.heatmapService.generateHeatmap(
						goal.deposits,
						goal.startDate,
						goal.endDate,
					)
				: null

		return {
			...goal,
			amount: targetAmount,
			currentAmount,
			progress,
			isCompleted: currentAmount >= targetAmount,
			breakdown,
			paceStatus,
			heatmap,
		}
	}

	/**
	 * UPDATE
	 */
	async update(userId: string, id: string, data: UpdateGoalDto) {
		const goal = await this.prisma.goal.findFirst({
			where: { id, userId },
		})

		if (!goal) throw new BadRequestException('Goal not found')

		if (Object.keys(data).length === 0)
			throw new BadRequestException('No data provided for update')

		const updatedGoal = await this.prisma.goal.update({
			where: { id },
			data: {
				...(data.title && { title: data.title }),
				...(data.amount && { amount: data.amount }),
				...(data.type && { type: data.type }),
				...(data.startDate && { startDate: data.startDate }),
				...(data.endDate !== undefined && { endDate: data.endDate }),
				...(data.bankAccountId !== undefined && {
					bankAccountId: data.bankAccountId,
				}),
				...(data.categoryId !== undefined && {
					categoryId: data.categoryId,
				}),
			},
			include: {
				category: true,
				bankAccount: true,
			},
		})

		const targetAmount = Number(updatedGoal.amount)
		const currentAmount = Number(updatedGoal.currentAmount)

		return {
			...updatedGoal,
			amount: targetAmount,
			currentAmount,
			progress:
				targetAmount > 0
					? Number(((currentAmount / targetAmount) * 100).toFixed(2))
					: 0,
		}
	}

	/**
	 * DELETE
	 */
	async delete(userId: string, id: string) {
		const goal = await this.prisma.goal.findFirst({
			where: {
				id,
				userId,
			},
		})

		if (!goal) throw new BadRequestException('Goal not found')

		await this.prisma.goal.delete({
			where: {
				id,
			},
		})

		return {
			id,
			message: 'Goal deleted successfully',
		}
	}

	/**
	 * ADD DEPOSIT
	 */
	async addDeposit(userId: string, goalId: string, data: CreateDepositDto) {
		const goal = await this.prisma.goal.findFirst({
			where: { id: goalId, userId },
		})

		if (!goal) throw new BadRequestException('Goal not found')

		if (goal.type !== GoalType.SAVINGS)
			throw new BadRequestException(
				'Deposits can only be added to savings goals',
			)

		const currentAmount = Number(goal.currentAmount)
		const targetAmount = Number(goal.amount)

		if (currentAmount >= targetAmount)
			throw new BadRequestException('Goal already completed')

		const newTotal = currentAmount + data.amount
		const actualDeposit =
			newTotal > targetAmount ? targetAmount - currentAmount : data.amount

		const [deposit, updatedGoal] = await this.prisma.$transaction([
			this.prisma.deposit.create({
				data: {
					amount: actualDeposit,
					date: data.date ?? new Date(),
					note: data.note,
					goalId,
				},
			}),
			this.prisma.goal.update({
				where: { id: goalId },
				data: { currentAmount: { increment: actualDeposit } },
				include: { category: true, bankAccount: true },
			}),
		])

		const finalAmount = Number(updatedGoal.currentAmount)
		const finalTarget = Number(updatedGoal.amount)
		const progress = Number(((finalAmount / finalTarget) * 100).toFixed(2))
		const isCompleted = finalAmount >= finalTarget

		const breakdown = this.savingsService.calculateSavingsBreakdown(
			finalTarget - finalAmount,
			updatedGoal.endDate,
		)

		const paceStatus = this.savingsService.calculatePaceStatus(
			finalAmount,
			finalTarget,
			updatedGoal.startDate,
			updatedGoal.endDate,
		)

		if (isCompleted) {
			this.notificationService
				.checkSavingsGoalCompletion(
					userId,
					goalId,
					finalAmount,
					finalTarget,
					updatedGoal.title,
				)
				.catch(() => {})
		}

		return {
			deposit: { ...deposit, amount: Number(deposit.amount) },
			goal: {
				...updatedGoal,
				amount: finalTarget,
				currentAmount: finalAmount,
				progress,
				isCompleted,
				breakdown,
				paceStatus,
			},
			message: isCompleted ? 'Goal completed!' : 'Deposit added successfully',
		}
	}

	/**
	 * GET DEPOSITS
	 */
	async getDeposits(userId: string, goalId: string) {
		const goal = await this.prisma.goal.findFirst({
			where: {
				id: goalId,
				userId,
			},
		})

		if (!goal) throw new BadRequestException('Goal not found')

		const deposits = await this.prisma.deposit.findMany({
			where: { goalId },
			orderBy: { date: 'desc' },
		})

		return {
			goalId,
			totalDeposits: deposits.length,
			totalAmount: deposits.reduce((sum, d) => sum + Number(d.amount), 0),
			deposits: deposits.map((d) => ({
				...d,
				amount: Number(d.amount),
			})),
		}
	}
}
