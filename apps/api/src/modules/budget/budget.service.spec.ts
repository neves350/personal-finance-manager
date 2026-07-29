import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaClientKnownRequestError } from 'src/generated/prisma/internal/prismaNamespace'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { BudgetService } from './budget.service'

const mockCategory = {
	id: 'category-id',
	title: 'Groceries',
	icon: 'shopping-cart',
	color: '#22c55e',
	type: 'EXPENSE',
}

const mockEnvelope = {
	id: 'envelope-id',
	budgetId: 'budget-id',
	categoryId: 'category-id',
	allocatedAmount: '300',
	category: mockCategory,
}

const mockBudget = {
	id: 'budget-id',
	userId: 'user-id',
	month: 6,
	year: 2026,
	note: 'June budget',
	createdAt: new Date(),
	updatedAt: new Date(),
}

describe('BudgetService', () => {
	let service: BudgetService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BudgetService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<BudgetService>(BudgetService)
		jest.clearAllMocks()
	})

	describe('create', () => {
		it('should create a budget', async () => {
			mockPrisma.budget.create.mockResolvedValue(mockBudget)

			const result = await service.create(
				{ month: 6, year: 2026, note: 'June budget' },
				'user-id',
			)

			expect(result).toHaveProperty('id')
			expect(result.month).toBe(6)
			expect(result.year).toBe(2026)
		})
		it('should throw ConflictException on duplicate month/year', async () => {
			const prismaError = new PrismaClientKnownRequestError(
				'Unique constraint failed',
				{ code: 'P2002', clientVersion: '5.0.0' },
			)
			mockPrisma.budget.create.mockRejectedValue(prismaError)

			await expect(
				service.create({ month: 6, year: 2026 }, 'user-id'),
			).rejects.toThrow(ConflictException)
		})
	})

	describe('update', () => {
		it('should update a budget note', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.budget.update.mockResolvedValue({
				...mockBudget,
				note: 'Updated note',
			})

			const result = await service.update('user-id', 'budget-id', {
				note: 'Updated note',
			})

			expect(result.note).toBe('Updated note')
		})
		it('should throw if budget not found', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(null)

			await expect(
				service.update('user-id', 'invalid-id', { note: 'test' }),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('delete', () => {
		it('should delete a budget', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.budget.delete.mockResolvedValue(mockBudget)

			const result = await service.delete('user-id', 'budget-id')

			expect(result).toHaveProperty('message')
		})
		it('should throw if budget not found', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(null)

			await expect(service.delete('user-id', 'invalid-id')).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('findAll', () => {
		it('should return all budgets', async () => {
			mockPrisma.budget.findMany.mockResolvedValue([
				{
					id: 'budget-1',
					month: 6,
					year: 2026,
					note: null,
					createdAt: new Date(),
				},
				{
					id: 'budget-2',
					month: 5,
					year: 2026,
					note: null,
					createdAt: new Date(),
				},
			])

			const result = await service.findAll('user-id')

			expect(result).toHaveLength(2)
		})
	})

	describe('findByMonthYear', () => {
		it('should return budget with envelopes and calculated spent', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				...mockBudget,
				envelopes: [mockEnvelope],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'category-id', _sum: { amount: '220' } },
			])

			const result = await service.findByMonthYear('user-id', 6, 2026)

			expect(result).toHaveProperty('envelopes')
			expect(result).toHaveProperty('summary')
			expect(result.envelopes[0].allocatedAmount).toBe(300)
			expect(result.envelopes[0].spentAmount).toBe(220)
			expect(result.envelopes[0].remainingAmount).toBe(80)
			expect(result.envelopes[0].status).toBe('on_track')
		})
		it('should set status to warning when progress >= 80%', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				...mockBudget,
				envelopes: [mockEnvelope],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'category-id', _sum: { amount: '260' } },
			])

			const result = await service.findByMonthYear('user-id', 6, 2026)

			expect(result.envelopes[0].status).toBe('warning')
		})
		it('should set status to overspent when progress >= 100%', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				...mockBudget,
				envelopes: [mockEnvelope],
			})
			mockPrisma.transaction.groupBy.mockResolvedValue([
				{ categoryId: 'category-id', _sum: { amount: '350' } },
			])

			const result = await service.findByMonthYear('user-id', 6, 2026)

			expect(result.envelopes[0].status).toBe('overspent')
			expect(result.envelopes[0].remainingAmount).toBeLessThan(0)
		})
		it('should return empty envelopes when budget has none', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue({
				...mockBudget,
				envelopes: [],
			})

			const result = await service.findByMonthYear('user-id', 6, 2026)

			expect(result.envelopes).toHaveLength(0)
			expect(result.summary.envelopeCount).toBe(0)
		})
		it('should throw NotFoundException if budget not found', async () => {
			mockPrisma.budget.findUnique.mockResolvedValue(null)

			await expect(service.findByMonthYear('user-id', 1, 2025)).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('addEnvelope', () => {
		it('should add an envelope', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
				type: 'EXPENSE',
			})
			mockPrisma.envelope.create.mockResolvedValue(mockEnvelope)

			const result = await service.addEnvelope('user-id', 'budget-id', {
				categoryId: 'category-id',
				allocatedAmount: 300,
			})

			expect(result).toHaveProperty('id')
			expect(result).toHaveProperty('category')
		})
		it('should throw if budget not found', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(null)

			await expect(
				service.addEnvelope('user-id', 'invalid-id', {
					categoryId: 'category-id',
					allocatedAmount: 300,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if category not found', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(
				service.addEnvelope('user-id', 'budget-id', {
					categoryId: 'invalid-id',
					allocatedAmount: 300,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if category is not EXPENSE', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
				type: 'INCOME',
			})

			await expect(
				service.addEnvelope('user-id', 'budget-id', {
					categoryId: 'category-id',
					allocatedAmount: 300,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw ConflictException on duplicate category', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(mockBudget)
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
				userId: 'user-id',
				type: 'EXPENSE',
			})
			const prismaError = new PrismaClientKnownRequestError(
				'Unique constraint failed',
				{ code: 'P2002', clientVersion: '5.0.0' },
			)
			mockPrisma.envelope.create.mockRejectedValue(prismaError)

			await expect(
				service.addEnvelope('user-id', 'budget-id', {
					categoryId: 'category-id',
					allocatedAmount: 300,
				}),
			).rejects.toThrow(ConflictException)
		})
	})

	describe('updateEnvelope', () => {
		it('should update an envelope allocation', async () => {
			mockPrisma.envelope.findFirst.mockResolvedValue(mockEnvelope)
			mockPrisma.envelope.update.mockResolvedValue({
				...mockEnvelope,
				allocatedAmount: '500',
			})

			const result = await service.updateEnvelope(
				'user-id',
				'budget-id',
				'envelope-id',
				{ allocatedAmount: 500 },
			)

			expect(result.allocatedAmount).toBe('500')
		})
		it('should throw if envelope not found', async () => {
			mockPrisma.envelope.findFirst.mockResolvedValue(null)

			await expect(
				service.updateEnvelope('user-id', 'budget-id', 'invalid-id', {
					allocatedAmount: 500,
				}),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('removeEnvelope', () => {
		it('should remove an envelope', async () => {
			mockPrisma.envelope.findFirst.mockResolvedValue(mockEnvelope)
			mockPrisma.envelope.delete.mockResolvedValue(mockEnvelope)

			const result = await service.removeEnvelope(
				'user-id',
				'budget-id',
				'envelope-id',
			)

			expect(result).toHaveProperty('message')
		})
		it('should throw if envelope not found', async () => {
			mockPrisma.envelope.findFirst.mockResolvedValue(null)

			await expect(
				service.removeEnvelope('user-id', 'budget-id', 'invalid-id'),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('transferBetweenEnvelopes', () => {
		it('should transfer between envelopes', async () => {
			mockPrisma.envelope.findFirst
				.mockResolvedValueOnce({ id: 'from-id', allocatedAmount: '300' })
				.mockResolvedValueOnce({ id: 'to-id', allocatedAmount: '100' })
			mockPrisma.$transaction.mockResolvedValue([
				{ id: 'from-id', allocatedAmount: '250', category: mockCategory },
				{ id: 'to-id', allocatedAmount: '150', category: mockCategory },
			])

			const result = await service.transferBetweenEnvelopes(
				'user-id',
				'budget-id',
				{ fromEnvelopeId: 'from-id', toEnvelopeId: 'to-id', amount: 50 },
			)

			expect(result).toHaveProperty('from')
			expect(result).toHaveProperty('to')
		})
		it('should throw if same envelope', async () => {
			await expect(
				service.transferBetweenEnvelopes('user-id', 'budget-id', {
					fromEnvelopeId: 'same-id',
					toEnvelopeId: 'same-id',
					amount: 50,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if source envelope not found', async () => {
			mockPrisma.envelope.findFirst
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({ id: 'to-id', allocatedAmount: '100' })

			await expect(
				service.transferBetweenEnvelopes('user-id', 'budget-id', {
					fromEnvelopeId: 'invalid-id',
					toEnvelopeId: 'to-id',
					amount: 50,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if target envelope not found', async () => {
			mockPrisma.envelope.findFirst
				.mockResolvedValueOnce({ id: 'from-id', allocatedAmount: '300' })
				.mockResolvedValueOnce(null)

			await expect(
				service.transferBetweenEnvelopes('user-id', 'budget-id', {
					fromEnvelopeId: 'from-id',
					toEnvelopeId: 'invalid-id',
					amount: 50,
				}),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if amount exceeds source allocation', async () => {
			mockPrisma.envelope.findFirst
				.mockResolvedValueOnce({ id: 'from-id', allocatedAmount: '30' })
				.mockResolvedValueOnce({ id: 'to-id', allocatedAmount: '100' })

			await expect(
				service.transferBetweenEnvelopes('user-id', 'budget-id', {
					fromEnvelopeId: 'from-id',
					toEnvelopeId: 'to-id',
					amount: 50,
				}),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('copyFromPrevious', () => {
		it('should copy envelopes from previous month', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue({
				...mockBudget,
				envelopes: [],
			})
			mockPrisma.budget.findUnique
				.mockResolvedValueOnce({
					id: 'prev-budget-id',
					userId: 'user-id',
					month: 5,
					year: 2026,
					envelopes: [
						{ categoryId: 'cat-1', allocatedAmount: '200' },
						{ categoryId: 'cat-2', allocatedAmount: '150' },
					],
				})
				.mockResolvedValueOnce({
					...mockBudget,
					envelopes: [
						{ ...mockEnvelope, categoryId: 'cat-1', allocatedAmount: '200' },
						{
							...mockEnvelope,
							id: 'env-2',
							categoryId: 'cat-2',
							allocatedAmount: '150',
						},
					],
				})
			mockPrisma.envelope.createMany.mockResolvedValue({ count: 2 })
			mockPrisma.transaction.groupBy.mockResolvedValue([])

			const result = await service.copyFromPrevious('user-id', 'budget-id')

			expect(result).toHaveProperty('envelopes')
			expect(result.envelopes).toHaveLength(2)
			expect(mockPrisma.envelope.createMany).toHaveBeenCalled()
		})
		it('should throw if budget not found', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue(null)

			await expect(
				service.copyFromPrevious('user-id', 'invalid-id'),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if budget already has envelopes', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue({
				...mockBudget,
				envelopes: [mockEnvelope],
			})

			await expect(
				service.copyFromPrevious('user-id', 'budget-id'),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if no previous month budget exists', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue({
				...mockBudget,
				envelopes: [],
			})
			mockPrisma.budget.findUnique.mockResolvedValue(null)

			await expect(
				service.copyFromPrevious('user-id', 'budget-id'),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if previous month has no envelopes', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue({
				...mockBudget,
				envelopes: [],
			})
			mockPrisma.budget.findUnique.mockResolvedValue({
				id: 'prev-budget-id',
				month: 5,
				year: 2026,
				envelopes: [],
			})

			await expect(
				service.copyFromPrevious('user-id', 'budget-id'),
			).rejects.toThrow(BadRequestException)
		})
		it('should wrap year when budget is January', async () => {
			mockPrisma.budget.findFirst.mockResolvedValue({
				...mockBudget,
				month: 1,
				year: 2026,
				envelopes: [],
			})
			mockPrisma.budget.findUnique
				.mockResolvedValueOnce({
					id: 'prev-budget-id',
					month: 12,
					year: 2025,
					envelopes: [{ categoryId: 'cat-1', allocatedAmount: '200' }],
				})
				.mockResolvedValueOnce({
					...mockBudget,
					month: 1,
					year: 2026,
					envelopes: [
						{ ...mockEnvelope, categoryId: 'cat-1', allocatedAmount: '200' },
					],
				})
			mockPrisma.envelope.createMany.mockResolvedValue({ count: 1 })
			mockPrisma.transaction.groupBy.mockResolvedValue([])

			const result = await service.copyFromPrevious('user-id', 'budget-id')

			expect(mockPrisma.budget.findUnique).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						userId_month_year: { userId: 'user-id', month: 12, year: 2025 },
					},
				}),
			)
			expect(result).toHaveProperty('envelopes')
		})
	})
})
