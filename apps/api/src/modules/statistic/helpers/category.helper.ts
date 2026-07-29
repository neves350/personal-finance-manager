import { Injectable } from '@nestjs/common'

import { Type } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CategoryBreakdownItem } from '../dtos/category-breakdown.dto'
import { NumberHelper } from './number.helper'

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async getCategoryBreakdown(
		filters: any,
		type: Type,
	): Promise<CategoryBreakdownItem[]> {
		const grouped = await this.prisma.transaction.groupBy({
			by: ['categoryId'],
			where: { ...filters, type },
			_sum: { amount: true },
			_count: true,
			orderBy: { _sum: { amount: 'desc' } },
		})

		const total = grouped.reduce(
			(sum, item) => sum + NumberHelper.toNumber(item._sum.amount),
			0,
		)

		const categoriesWithDetails = await Promise.all(
			grouped.map(async (item) => {
				const category = await this.prisma.category.findUnique({
					where: { id: item.categoryId },
					select: { title: true, icon: true },
				})

				const amount = NumberHelper.toNumber(item._sum.amount)
				const percentage = total > 0 ? (amount / total) * 100 : 0

				return {
					categoryId: item.categoryId,
					categoryTitle: category?.title || 'Unknown',
					categoryIcon: category?.icon || 'shopping-cart',
					total: amount,
					percentage: NumberHelper.round(percentage, 2),
					transactionCount: item._count,
				}
			}),
		)

		return categoriesWithDetails
	}

	async getTopExpenseCategories(
		filters: any,
		totalExpenses: number,
	): Promise<CategoryBreakdownItem[]> {
		const topCategories = await this.prisma.transaction.groupBy({
			by: ['categoryId'],
			where: { ...filters, type: Type.EXPENSE },
			_sum: { amount: true },
			_count: true,
			orderBy: { _sum: { amount: 'desc' } },
			take: 3,
		})

		const categoriesWithDetails = await Promise.all(
			topCategories.map(async (item) => {
				const category = await this.prisma.category.findUnique({
					where: { id: item.categoryId },
					select: { title: true, icon: true },
				})

				const amount = NumberHelper.toNumber(item._sum.amount)
				const percentage =
					totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0

				return {
					categoryId: item.categoryId,
					categoryTitle: category?.title || 'Unknown',
					categoryIcon: category?.icon || 'shopping-cart',
					total: amount,
					percentage: NumberHelper.round(percentage, 2),
					transactionCount: item._count,
				}
			}),
		)

		return categoriesWithDetails
	}
}
