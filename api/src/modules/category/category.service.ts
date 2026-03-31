import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateCategory } from './dtos/create-category.dto'
import type { CategoryType } from './dtos/query-category.dto'
import { UpdateCategoryDto } from './dtos/update-category.dto'

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createCategory: CreateCategory, userId: string) {
		const { title, icon, type } = createCategory

		// create category
		const category = this.prisma.category.create({
			data: {
				title,
				icon,
				type,
				isDefault: false,
				userId,
			},
		})

		return category
	}

	async findAll(userId: string, type?: CategoryType) {
		return this.prisma.category.findMany({
			where: {
				userId,
				...(type && { type }),
			},
		})
	}

	async findOne(categoryId: string, userId: string) {
		const category = await this.prisma.category.findFirst({
			where: {
				id: categoryId,
				userId,
			},
		})

		if (!category) throw new NotFoundException('Category not found')

		return category
	}

	async update(
		categoryId: string,
		userId: string,
		updateCategoryDto: UpdateCategoryDto,
	) {
		// check if category is own userId
		const category = await this.prisma.category.findFirst({
			where: {
				id: categoryId,
				userId,
			},
		})

		if (!category) throw new NotFoundException('Category not found')

		// update category
		const updatedCategory = await this.prisma.category.update({
			where: {
				id: categoryId,
			},
			data: updateCategoryDto,
		})

		return updatedCategory
	}

	async delete(categoryId: string, userId: string) {
		const category = await this.prisma.category.findUnique({
			where: { id: categoryId },
		})

		if (!category) throw new NotFoundException('Category not found')

		await this.prisma.category.delete({
			where: { id: categoryId, userId },
		})

		return {
			message: 'Category deleted successfully',
			success: true,
		}
	}
}
