import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { mockPrisma } from 'src/__mocks__/prisma.mock'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { TransferService } from './transfer.service'

describe('TransferService', () => {
	let service: TransferService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransferService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile()

		service = module.get<TransferService>(TransferService)
	})

	describe('transfer', () => {
		it('should create a transfer', async () => {
			// Promise.all calls findFirst twice
			// mockResolvedValueOnce is used for each
			mockPrisma.bankAccount.findFirst
				.mockResolvedValueOnce({
					id: 'account-1',
					userId: 'user-id',
					balance: 100,
				})
				.mockResolvedValueOnce({
					id: 'account-2',
					userId: 'user-id',
					balance: 0,
				})
			// array form: $transaction([create, update, update]) → resolves to [transfer, {}, {}]
			mockPrisma.$transaction.mockResolvedValue([
				{
					id: 'transfer-id',
					fromAccountId: 'account-1',
					toAccountId: 'account-2',
					status: 'COMPLETED',
				},
				{},
				{},
			])

			const result = await service.transfer('user-id', {
				fromAccountId: 'account-1',
				toAccountId: 'account-2',
				amount: 50,
				date: new Date('2026-01-02'),
			})

			expect(result).toHaveProperty('transfer')
			expect(result).toHaveProperty('message')
		})
		it('should create a scheduled transfer', async () => {
			mockPrisma.bankAccount.findFirst
				.mockResolvedValueOnce({
					id: 'account-1',
					userId: 'user-id',
					balance: 100,
				})
				.mockResolvedValueOnce({
					id: 'account-2',
					userId: 'user-id',
					balance: 0,
				})
			mockPrisma.transfer.create.mockResolvedValue({
				id: 'transfer-id',
				fromAccountId: 'account-1',
				toAccountId: 'account-2',
				amount: 50,
				status: 'PENDING',
			})

			const result = await service.transfer('user-id', {
				fromAccountId: 'account-1',
				toAccountId: 'account-2',
				amount: 50,
				date: new Date('2027-01-01'), // future date → isScheduled = true
			})

			expect(result).toHaveProperty('transfer')
			expect(result).toHaveProperty('message')
		})
		it('should throw if source account not found', async () => {
			mockPrisma.bankAccount.findFirst
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({
					id: 'account-2',
					userId: 'user-id',
					balance: 0,
				})

			await expect(
				service.transfer('user-id', {
					fromAccountId: 'account-1',
					toAccountId: 'account-2',
					amount: 50,
					date: new Date('2026-01-02'),
				}),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if destination account not found', async () => {
			mockPrisma.bankAccount.findFirst
				.mockResolvedValueOnce({
					id: 'account-1',
					userId: 'user-id',
					balance: 100,
				})
				.mockResolvedValueOnce(null)

			await expect(
				service.transfer('user-id', {
					fromAccountId: 'account-1',
					toAccountId: 'account-2',
					amount: 50,
					date: new Date('2026-01-02'),
				}),
			).rejects.toThrow(NotFoundException)
		})
		it('should throw if insufficient balance', async () => {
			mockPrisma.bankAccount.findFirst
				.mockResolvedValueOnce({
					id: 'account-1',
					userId: 'user-id',
					balance: 10,
				})
				.mockResolvedValueOnce({
					id: 'account-2',
					userId: 'user-id',
					balance: 0,
				})

			await expect(
				service.transfer('user-id', {
					fromAccountId: 'account-1',
					toAccountId: 'account-2',
					amount: 50, // 50 > balance of 10
					date: new Date('2026-01-02'),
				}),
			).rejects.toThrow(BadRequestException)
		})
	})

	describe('findAll', () => {
		it('should return all transfers', async () => {
			mockPrisma.transfer.findMany.mockResolvedValue([{ id: 'transfer-id' }])
			mockPrisma.transfer.count.mockResolvedValue(1)

			const result = await service.findAll('user-id', {})

			expect(result).toHaveProperty('data')
			expect(result).toHaveProperty('count')
		})
	})

	describe('findOne', () => {
		it('should return a transfer', async () => {
			mockPrisma.transfer.findUnique.mockResolvedValue({
				id: 'transfer-id',
				userId: 'user-id',
			})

			const result = await service.findOne('id', 'user-id')

			expect(result).toHaveProperty('id')
		})
		it('should throw if transfer not found', async () => {
			mockPrisma.transfer.findUnique.mockResolvedValue(null)

			await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
				NotFoundException,
			)
		})
	})
})
