import {
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { NotificationService } from '../notification/notification.service'
import { TransactionType } from './dtos/query-transaction.dto'
import { TransactionService } from './transaction.service'

const mockNotificationService = {
	checkBudgetThresholds: jest.fn().mockResolvedValue(undefined),
	checkSpendingLimitGoals: jest.fn().mockResolvedValue(undefined),
}

describe('TransactionService', () => {
	let service: TransactionService

	beforeEach(async () => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransactionService,
				{ provide: PrismaService, useValue: mockPrisma },
				{
					provide: NotificationService,
					useValue: mockNotificationService,
				},
			],
		}).compile()

		service = module.get<TransactionService>(TransactionService)
	})

	describe('create', () => {
		it('should create a transaction', async () => {
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
					transaction: {
						create: jest.fn().mockResolvedValue({
							id: 'transaction-id',
							title: 'Transaction 1',
						}),
					},
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			const result = await service.create(
				{
					title: 'Transaction 1',
					amount: 10,
					type: TransactionType.INCOME,
					date: new Date('2026-03-10'),
					bankAccountId: 'account-id',
					categoryId: 'category-id',
				},
				'user-id',
			)

			expect(result).toHaveProperty('id')
		})
		it('should throw if amount is lowest than 0', async () => {
			await expect(
				service.create(
					{
						title: 'Transaction 1',
						amount: 0,
						type: TransactionType.INCOME,
						date: new Date('2026-03-10'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(BadRequestException)
		})
		it('should throw if date is in the future', async () => {
			await expect(
				service.create(
					{
						title: 'Transaction 1',
						amount: 10,
						type: TransactionType.INCOME,
						date: new Date('2030-01-01'),
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
						title: 'Transaction 1',
						amount: 10,
						type: TransactionType.INCOME,
						date: new Date('2026-03-10'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
						cardId: 'card-id', // required to trigger card validation
					},
					'user-id',
				),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if category not found', async () => {
			mockPrisma.category.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						title: 'Transaction 1',
						amount: 10,
						type: TransactionType.INCOME,
						date: new Date('2026-03-10'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if account not found', async () => {
			mockPrisma.category.findFirst.mockResolvedValue({ id: 'category-id' })
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.create(
					{
						title: 'Transaction 1',
						amount: 10,
						type: TransactionType.INCOME,
						date: new Date('2026-03-10'),
						bankAccountId: 'account-id',
						categoryId: 'category-id',
					},
					'user-id',
				),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('findAll', () => {
		it('should return paginated transactions', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([
				{
					userId: 'user-id',
				},
			])
			mockPrisma.transaction.count.mockResolvedValue(1)
			mockPrisma.transaction.findMany.mockResolvedValue([
				{
					id: 'transaction-id',
					title: 'Transaction 1',
				},
			])

			const result = await service.findAll({}, 'user-id')

			expect(result).toHaveProperty('data')
			expect(result).toHaveProperty('meta')
		})
		it('should return empty result when user has no accounts', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([])

			const result = await service.findAll({}, 'user-id')

			expect(result.data).toEqual([])
			expect(result.meta.total).toBe(0)
		})
	})

	describe('findOne', () => {
		it('should return a transaction', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([{ id: 'account-id' }]) // accountIds becomes [account-id]
			mockPrisma.transaction.findFirst.mockResolvedValue({
				id: 'transaction-id',
				bankAccountId: 'account-id',
			})

			const result = await service.findOne('id', 'user-id')

			expect(result).toHaveProperty('id')
		})
		it('should throw if transaction not found', async () => {
			mockPrisma.bankAccount.findMany.mockResolvedValue([{ id: 'account-id' }])
			mockPrisma.transaction.findFirst.mockResolvedValue(null)

			await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('update', () => {
		it('should update a transaction', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue({
				id: 'transaction-id',
				type: 'INCOME',
				amount: '10.00',
				bankAccountId: 'account-id',
			})
			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
					transaction: {
						update: jest.fn().mockResolvedValue({
							id: 'transaction-id',
							bankAccountId: 'account-id',
						}),
					},
				}),
			)

			const result = await service.update('id', 'user-id', {
				title: 'Transaction 1',
			})

			expect(result).toHaveProperty('id')
		})
		it('should throw if card does not belong', async () => {
			mockPrisma.card.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', {
					title: 'Transaction 1',
					cardId: 'card-id', // required to trigger card validation
				}),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if account does not belong', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', {
					title: 'Transaction 1',
					bankAccountId: 'account-id', // required to trigger account validation
				}),
			).rejects.toThrow(ForbiddenException)
		})
		it('should throw if transaction not found', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', { title: 'Transaction 1' }),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should delete a transaction', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue({
				id: 'transaction-id',
				type: 'EXPENSE',
				amount: '50.00',
				bankAccountId: 'account-id',
				bankAccount: {
					id: 'account-id',
					userId: 'user-id',
				},
			})
			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					transaction: {
						delete: jest.fn().mockResolvedValue({}),
					},
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			const result = await service.delete('id', 'user-id')

			expect(result).toHaveProperty('message')
		})
		it('should throw if transaction not found', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue(null)

			await expect(service.delete('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
		it('should throw if transaction can not be deleted', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue({
				id: 'transaction-id',
				bankAccount: {
					userId: 'user-id', // different passed to  delete()
				},
			})

			await expect(
				service.delete('transaction-id', 'other-id'),
			).rejects.toThrow(ForbiddenException)
		})
	})

	describe('notification hooks', () => {
		it('should fire notification checks after create', async () => {
			mockPrisma.category.findFirst.mockResolvedValue({
				id: 'category-id',
			})
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})
			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					transaction: {
						create: jest.fn().mockResolvedValue({
							id: 'tx-id',
							title: 'Test',
							categoryId: 'category-id',
							date: new Date('2026-06-15'),
						}),
					},
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			await service.create(
				{
					title: 'Test',
					amount: 50,
					type: TransactionType.EXPENSE,
					date: new Date('2026-06-15'),
					bankAccountId: 'account-id',
					categoryId: 'category-id',
				},
				'user-id',
			)

			expect(
				mockNotificationService.checkBudgetThresholds,
			).toHaveBeenCalledWith('user-id', expect.any(Date))
			expect(
				mockNotificationService.checkSpendingLimitGoals,
			).toHaveBeenCalledWith(
				'user-id',
				'category-id',
				expect.any(Date),
			)
		})

		it('should fire notification checks after delete', async () => {
			mockPrisma.transaction.findFirst.mockResolvedValue({
				id: 'tx-id',
				type: 'EXPENSE',
				amount: '50.00',
				categoryId: 'cat-1',
				date: new Date('2026-06-10'),
				bankAccountId: 'account-id',
				bankAccount: {
					id: 'account-id',
					userId: 'user-id',
				},
			})
			mockPrisma.$transaction.mockImplementation(async (fn) =>
				fn({
					transaction: {
						delete: jest.fn().mockResolvedValue({}),
					},
					bankAccount: {
						update: jest.fn().mockResolvedValue({}),
					},
				}),
			)

			await service.delete('tx-id', 'user-id')

			expect(
				mockNotificationService.checkBudgetThresholds,
			).toHaveBeenCalledWith('user-id', expect.any(Date))
			expect(
				mockNotificationService.checkSpendingLimitGoals,
			).toHaveBeenCalledWith('user-id', 'cat-1', expect.any(Date))
		})
	})
})
