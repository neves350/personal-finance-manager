import {
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import {
	FrequencyType,
	PaymentMethod,
	RecurringType,
} from './dtos/create-recurring.dto'
import { RecurringService } from './recurring.service'

describe('RecurringService', () => {
	let service: RecurringService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RecurringService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<RecurringService>(RecurringService)
	})

	describe('create', () => {
		it('should create a recurring', async () => {
			mockPrisma.card.findFirst.mockResolvedValue({
				id: 'card-id',
				userId: 'user-id',
			})
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
			})
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})
			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					recurring: {
						create: jest.fn().mockResolvedValue({
							id: 'recurring-id',
							description: 'Recurring 1',
							amount: 20,
							type: RecurringType.INCOME,
							frequency: FrequencyType.MONTH,
							paymentMethod: PaymentMethod.MONEY,
							startDate: new Date('2026-03-15'),
							bankAccountId: 'account-id',
							categoryId: 'category-id',
						}),
						update: jest.fn().mockResolvedValue({}),
					},
					transaction: {
						create: jest.fn().mockResolvedValue({
							title: 'Recurring 1',
							amount: 20,
							type: RecurringType.INCOME,
							date: new Date('2026-03-15'),
							isPaid: true,
							recurringId: 'recurring-id',
							bankAccountId: 'account-id',
							categoryId: 'category-id',
						}),
					},
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			const result = await service.create(
				{
					description: 'Recurring 1',
					amount: 10,
					type: RecurringType.INCOME,
					frequency: FrequencyType.MONTH,
					startDate: new Date('2026-03-15'),
					bankAccountId: 'account-id',
					categoryId: 'category-id',
					cardId: 'card-id',
				},
				'user-id',
			)

			expect(result).toHaveProperty('id')
		})
		it('should throw if amount is lowest than 0', async () => {
			await expect(
				service.create(
					{
						description: 'Recurring 1',
						amount: 0,
						type: RecurringType.INCOME,
						frequency: FrequencyType.MONTH,
						startDate: new Date('2026-03-15'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if card does not belong', async () => {
			mockPrisma.card.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						description: 'Recurring 1',
						amount: 10,
						type: RecurringType.INCOME,
						frequency: FrequencyType.MONTH,
						startDate: new Date('2026-03-15'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
						cardId: 'card-id',
					},
					'user-id',
				),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if category not found', async () => {
			mockPrisma.card.findFirst.mockResolvedValue({ id: 'card-id' })
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						description: 'Recurring 1',
						amount: 10,
						type: RecurringType.INCOME,
						frequency: FrequencyType.MONTH,
						startDate: new Date('2026-03-15'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if account not found', async () => {
			mockPrisma.card.findFirst.mockResolvedValue({ id: 'card-id' })
			mockPrisma.category.findFirst.mockResolvedValue({ id: 'category-id' })
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						description: 'Recurring 1',
						amount: 10,
						type: RecurringType.INCOME,
						frequency: FrequencyType.MONTH,
						startDate: new Date('2026-03-15'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(ForbiddenException)
		})
	})

	describe('findAll', () => {
		it('should return all recurrings', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([
				{
					userId: 'user-id',
				},
			])
			mockPrisma.recurring.findMany.mockResolvedValue([
				// findMany always return an array!
				{ id: 'recurring-id', bankAccountId: 'account-id' },
			])

			const result = await service.findAll('user-id')

			expect(result).toHaveProperty('recurrings')
			expect(result).toHaveProperty('total')
		})
	})

	describe('update', () => {
		it('should update a recurring', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})
			mockPrisma.recurring.findFirst.mockResolvedValue({
				id: 'recurring-id',
			})
			mockPrisma.recurring.update.mockResolvedValue({
				id: 'recurring-id',
			})

			const result = await service.update('recurring-id', 'user-id', {
				description: 'Recurring 1',
			})

			expect(result).toHaveProperty('id')
		})
		it('should throw if account does not belong', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', {
					description: 'Recurring 1',
					bankAccountId: 'account-id',
				}),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if recurring not found', async () => {
			mockPrisma.recurring.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', { description: 'Recurring 1' }),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should delete a recurring', async () => {
			mockPrisma.recurring.findFirst.mockResolvedValue({
				id: 'recurring-id',
				bankAccount: 'user-id',
			})
			mockPrisma.transaction.findMany.mockResolvedValue({
				id: 'recurring-id',
			})
			mockPrisma.recurring.delete.mockResolvedValue({
				id: 'recurring-id',
			})

			const result = await service.delete('recurring-id', 'user-id', false)

			expect(result).toHaveProperty('message')
		})
		it('should throw if recurring not found', async () => {
			mockPrisma.recurring.findFirst.mockResolvedValue(null)

			await expect(
				service.delete('invalid-id', 'user-id', false),
			).rejects.toThrow(NotFoundException)
		})
	})
})
