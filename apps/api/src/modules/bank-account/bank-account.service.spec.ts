import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { BankAccountService } from './bank-account.service'

describe('BankAccountService', () => {
	let service: BankAccountService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BankAccountService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<BankAccountService>(BankAccountService)
	})

	describe('create', () => {
		it('should create an account', async () => {
			mockPrisma.bankAccount.create.mockResolvedValue({
				id: 'account-id',
				name: 'Account 1',
				type: 'WALLET',
				balance: 10,
				userId: 'user-id',
			})

			const result = await service.create(
				{
					name: 'Account 1',
					type: 'WALLET',
					balance: 10,
				},
				'user-id',
			)

			expect(result).toHaveProperty('id')
		})
	})

	describe('findAll', () => {
		it('should find all accounts', async () => {
			mockPrisma.bankAccount.findMany.mockReturnValue({
				id: 'account-id',
				name: 'Account 1',
				balance: 10,
			})

			mockPrisma.bankAccount.aggregate.mockReturnValue({
				_sum: { balance: 10 },
				_count: { id: 1 },
			})

			const result = await service.findAll('user-id')

			expect(result).toHaveProperty('data')
			expect(result).toHaveProperty('total')
			expect(result).toHaveProperty('count')
		})
	})

	describe('findOne', () => {
		it('should return an account', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				name: 'Account 1',
				balance: 10,
				userId: 'user-id',
			})

			mockPrisma.transfer.count.mockResolvedValue(2)
			mockPrisma.transaction.count.mockResolvedValue(3)

			const result = await service.findOne('account-id', 'user-id')

			expect(result).toHaveProperty('totalMovements')
			expect(result.totalMovements).toBe(5)
		})
		it('should throw if account not found', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)
			mockPrisma.transfer.count.mockResolvedValue(0)
			mockPrisma.transaction.count.mockResolvedValue(0)

			await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})

	describe('update', () => {
		it('should update an account', async () => {
			mockPrisma.bankAccount.findFirst.mockReturnValue({
				id: 'account-id',
				name: 'Account 1',
				userId: 'user-id',
			})

			mockPrisma.bankAccount.update.mockResolvedValue({
				id: 'account-id',
				name: 'Updated Account',
				userId: 'user-id',
			})

			const result = await service.update('account-id', 'user-id', {
				name: 'Updated Account',
			})

			expect(result).toHaveProperty('name')
			expect(result.name).toBe('Updated Account')
		})
		it('should throw if account not found', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.update('invalid-id', 'user-id', { name: 'Updated Account' }),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should delete an account', async () => {
			mockPrisma.bankAccount.findUnique.mockResolvedValue({
				id: 'account-id',
				isLinked: false,
			})
			mockPrisma.card.count.mockResolvedValue(0)
			mockPrisma.transfer.deleteMany.mockResolvedValue({ count: 0 })
			mockPrisma.bankAccount.delete.mockResolvedValue({})

			const result = await service.delete('account-id')

			expect(result).toHaveProperty('message')
			expect(result).toHaveProperty('success', true)
		})
		it('should throw if account has linked cards', async () => {
			mockPrisma.bankAccount.findUnique.mockResolvedValue({
				id: 'account-id',
				isLinked: false,
			})
			mockPrisma.card.count.mockResolvedValue(2)

			await expect(service.delete('account-id')).rejects.toThrow(
				BadRequestException,
			)
		})
	})

	describe('getBalanceHistory', () => {
		it('should return 6 months of balance history', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
				initialBalance: 100,
			})

			mockPrisma.transaction.findMany.mockResolvedValue([])
			mockPrisma.transfer.findMany.mockResolvedValue([])
			mockPrisma.transfer.aggregate.mockResolvedValue({
				_sum: { amount: null },
			})

			const result = await service.getBalanceHistory('account-id', 'user-id')

			expect(result).toHaveProperty('data')
			expect(result.data).toHaveLength(6)
		})
		it('should throw if account not found', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.getBalanceHistory('invalid-id', 'user-id'),
			).rejects.toThrow(NotFoundException)
		})
	})

	describe('getRecentMovements', () => {
		it('should return recent movements', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue({
				id: 'account-id',
				userId: 'user-id',
			})

			mockPrisma.transaction.findMany.mockResolvedValue([
				{
					id: 'tx-1',
					amount: 50,
					type: 'EXPENSE',
					date: new Date('2026-03-10'),
					title: 'Coffee',
					category: { title: 'Food', type: 'EXPENSE' },
				},
			])

			mockPrisma.transfer.findMany.mockResolvedValue([])

			const result = await service.getRecentMovements('account-id', 'user-id')

			expect(result).toHaveProperty('data')
			expect(result.data).toHaveLength(1)
			expect(result.data[0]).toHaveProperty('type', 'transaction')
		})

		it('should throw if account not found', async () => {
			mockPrisma.bankAccount.findFirst.mockResolvedValue(null)

			await expect(
				service.getRecentMovements('invalid-id', 'user-id'),
			).rejects.toThrow(NotFoundException)
		})
	})
})
