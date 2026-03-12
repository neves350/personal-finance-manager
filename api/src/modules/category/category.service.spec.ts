import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CategoryService } from './category.service'
import { CategoryType } from './dtos/query-category.dto'

describe('CategoryService', () => {
	let service: CategoryService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CategoryService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<CategoryService>(CategoryService)
	})

	describe('create', () => {
		it('should create a category', async () => {
			mockPrisma.category.create.mockResolvedValue({
				id: 'category-id',
				title: 'Category 1',
				icon: 'tag',
				type: 'INCOME',
				userId: 'user-id',
			})

			const result = await service.create(
				{
					title: 'Category 1',
					icon: 'tag',
					type: CategoryType.INCOME,
				},
				'user-id',
			)

			expect(result).toHaveProperty('id')
		})
	})

	describe('findAll', () => {
		it('should find all categories', async () => {
			mockPrisma.category.findMany.mockResolvedValue([
				{
					id: 'category-id',
					title: 'Category 1',
					icon: 'tag',
					type: 'INCOME',
				},
			])

			const result = await service.findAll('user-id')

			expect(result).toHaveLength(1)
			expect(result[0]).toHaveProperty('type', 'INCOME')
		})
	})

	describe('findOne', () => {
		it('should return a category', async () => {
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
			})

			const result = await service.findOne('id', 'user-id')

			expect(result).toHaveProperty('id')
		})
		it('should throw if category not found', async () => {
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('update', () => {
		it('should update a category', async () => {
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				title: 'Category 1',
				userId: 'user-id',
			})

			mockPrisma.category.update.mockResolvedValue({
				id: 'category-id',
				title: 'Updated Category',
				userId: 'user-id',
			})

			const result = await service.update('category-id', 'user-id', {
				title: 'Updated Category',
			})

			expect(result).toHaveProperty('title')
			expect(result.title).toBe('Updated Category')
		})
		it('should throw if category not found', async () => {
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', { title: 'Updated Category' }),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should delete a category', async () => {
			mockPrisma.category.findUnique.mockResolvedValue({
				id: 'category-id',
			})

			mockPrisma.category.delete.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
			})

			const result = await service.delete('category-id', 'user-id')

			expect(result).toHaveProperty('message')
			expect(result).toHaveProperty('success', true)
		})
		it('should throw if category not found', async () => {
			mockPrisma.category.findUnique.mockResolvedValue(null)

			await expect(service.delete('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})
})
