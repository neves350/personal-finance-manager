import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CardService } from './card.service'

describe('CardService', () => {
	let service: CardService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CardService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<CardService>(CardService)
	})

	describe('create', () => {
		it('should create a card', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})

			mockPrisma.card.create.mockResolvedValue({
				id: 'card-id',
				name: 'Card 1',
				color: 'GREEN',
				type: 'DEBIT_CARD',
				lastFour: '1234',
				expirationDate: '12/28',
				cvc: '123',
				bankAccountId: 'account-id',
				userId: 'user-id',
			})

			const result = await service.create(
				{
					name: 'Card 1',
					color: 'GREEN',
					type: 'DEBIT_CARD',
					lastFour: '1234',
					expirationDate: '12/28',
					cvc: '123',
					bankAccountId: 'account-id',
				},
				'user-id',
			)

			expect(result).toHaveProperty('id')
		})
		it('should throw if account bad request', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						name: 'Card 1',
						bankAccountId: 'account-id',
						color: 'GREEN',
						cvc: '123',
						expirationDate: '12/28',
						type: 'DEBIT_CARD',
					},
					'user-id',
				),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should find all cards', async () => {
			mockPrisma.card.findMany.mockResolvedValue([
				{ id: 'card-id', name: 'Card 1' },
			])

			const result = await service.findAll('user-id', 'account-id')

			expect(result).toHaveProperty('cards')
			expect(result).toHaveProperty('total')
		})
	})

	describe('findOne', () => {
		it('should return a card', async () => {
			mockPrisma.card.findFirst.mockResolvedValue({
				id: 'card-id',
				userId: 'user-id',
			})

			const result = await service.findOne('id', 'user-id')

			expect(result).toHaveProperty('id')
		})
		it('should throw if card not found', async () => {
			mockPrisma.card.findFirst.mockResolvedValue(null)

			await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('updateById', () => {
		it('should update a card', async () => {
			mockPrisma.card.findFirst.mockResolvedValue({
				id: 'card-id',
				userId: 'user-id',
			})
			mockPrisma.card.update.mockResolvedValue({
				id: 'card-id',
				name: 'Updated Card',
				userId: 'user-id',
			})

			const result = await service.updateById('card-id', 'user-id', {
				name: 'Updated Card',
			})

			expect(result).toHaveProperty('name')
			expect(result.name).toBe('Updated Card')
		})
		it('should throw if card not found', async () => {
			mockPrisma.card.findFirst.mockResolvedValue(null)

			await expect(
				service.updateById('invalid-id', 'user-id', {
					name: 'Updated Card',
				}),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should delete a card', async () => {
			mockPrisma.card.delete.mockResolvedValue({
				id: 'card-id',
			})

			const result = await service.delete('id')

			expect(result).toHaveProperty('message')
			expect(result).toHaveProperty('success', true)
		})
	})

	describe('monthlyExpenses', () => {
		it('should return card monthly expenses', async () => {
			mockPrisma.transaction.aggregate.mockResolvedValue({
				_sum: { amount: 150 },
			})

			const result = await service.monthlyExpenses(
				'card-id',
				'2026-01-01',
				'2026-01-31',
			)

			expect(result).toHaveProperty('_sum')
			expect(result._sum).toHaveProperty('amount', 150)
		})
	})

	describe('getRecentTransactions', () => {
		it('should return card recent transactions', async () => {
			mockPrisma.transaction.findMany.mockResolvedValue([
				{
					id: 'tx-1',
					title: 'Transaction 1',
					type: 'EXPENSE',
					amount: '50.00', // raw Decimal from schema
					date: new Date('2026-03-10'),
					category: {
						id: 'cat-1',
						title: 'Category 1',
						type: 'EXPENSE',
						icon: 'tag',
					},
				},
			])

			const result = await service.getRecentTransactions('card-id')

			expect(result).toHaveLength(1)
			expect(result[0]).toHaveProperty('id', 'tx-1')
			expect(result[0]).toHaveProperty('amount', 50) // Number()
			expect(result[0]).toHaveProperty('category')
		})
	})

	describe('getCashflow', () => {
		it('should return 6 months of cashflow', async () => {
			mockPrisma.transaction.findMany.mockResolvedValue([])

			const result = await service.getCashflow('card-id')

			expect(result).toHaveProperty('data')
			expect(result.data).toHaveLength(6) // 6 months
		})
		it('should calculate income and expense correctly', async () => {
			mockPrisma.transaction.findMany.mockResolvedValue([
				{
					type: 'INCOME',
					amount: '100.00',
					date: new Date(),
				},
				{
					type: 'EXPENSE',
					amount: '50.00',
					date: new Date(),
				},
			])

			const result = await service.getCashflow('card-id')
			const currentMonth = result.data[result.data.length - 1]

			expect(currentMonth.income).toBe(100)
			expect(currentMonth.expense).toBe(50)
		})
	})
})
