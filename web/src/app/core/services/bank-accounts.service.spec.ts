import { TestBed } from '@angular/core/testing'
import { BankAccountsApi } from '@core/api/bank-accounts.api'
import { BankType } from '@core/api/bank-accounts.interface'
import { makeBankAccount } from '@core/testing/factories'
import { mockBankAccounts } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe } from 'vitest'
import { BankAccountsService } from './bank-accounts.service'

describe('BankAccountsService', () => {
	let service: BankAccountsService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: BankAccountsApi, useValue: mockBankAccounts }],
		})

		service = TestBed.inject(BankAccountsService)
	})

	describe('loadBankAccounts()', () => {
		it('should return all bank accounts and update signals', async () => {
			const firstAccount = makeBankAccount({ id: 'w-1', balance: 500 })
			const secondAccount = makeBankAccount({ id: 'w-2', balance: 1000 })
			const apiResponse = {
				data: [firstAccount, secondAccount],
				total: 1500,
				count: 2,
			}
			mockBankAccounts.findAll.mockReturnValue(of(apiResponse))

			const result = await firstValueFrom(service.loadBankAccounts())

			// return value
			expect(result).toEqual([firstAccount, secondAccount])

			// API has been called
			expect(mockBankAccounts.findAll).toHaveBeenCalledOnce()

			// signals on return response
			expect(service.bankAccounts()).toEqual([firstAccount, secondAccount])
			expect(service.totalBalance()).toBe(1500)
			expect(service.totalAccounts()).toBe(2)
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// derived computed signal
			expect(service.hasBankAccounts()).toBe(true)
		})

		it('should clear previous error before a new request', async () => {
			service.error.set('Previous error')
			mockBankAccounts.findAll.mockReturnValue(
				of({
					data: [],
					total: 0,
					count: 0,
				}),
			)

			await firstValueFrom(service.loadBankAccounts())

			expect(service.error()).toBeNull()
		})

		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')
			mockBankAccounts.findAll.mockReturnValue(throwError(() => apiError))

			// the observable propagates the error
			await expect(firstValueFrom(service.loadBankAccounts())).rejects.toThrow(
				'Network error',
			)

			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.bankAccounts()).toEqual([])
		})

		it('should fall back to default error message when err.message is missing', async () => {
			mockBankAccounts.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(
				firstValueFrom(service.loadBankAccounts()),
			).rejects.toBeDefined()

			expect(service.error()).toBe('Failed to load bank accounts')
		})
	})

	describe('create()', () => {
		const payload = {
			name: 'Bank Account 1',
			type: BankType.WALLET,
			balance: 500,
		}
		const bankAccount = makeBankAccount({
			id: 'w-1',
			name: 'Bank Account 1',
			type: BankType.WALLET,
			balance: 500,
			initialBalance: 100,
			isCardAccount: false,
			isLinked: true,
			totalMovements: 1,
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created bank account', async () => {
			mockBankAccounts.create.mockReturnValue(
				of({ bankAccount, message: 'Bank account created successfully' }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [bankAccount], total: 500, count: 1 }),
			)

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(bankAccount)
			expect(mockBankAccounts.create).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct payload', async () => {
			mockBankAccounts.create.mockReturnValue(
				of({ bankAccount, message: 'Bank account created successfully' }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [bankAccount], total: 500, count: 1 }),
			)

			await firstValueFrom(service.create(payload))

			expect(mockBankAccounts.create).toHaveBeenCalledWith(payload)
		})

		it('should update signals after creation', async () => {
			const secondAccount = makeBankAccount({ id: 'w-2', balance: 200 })
			mockBankAccounts.create.mockReturnValue(
				of({ bankAccount, message: 'Bank account created successfully' }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [bankAccount, secondAccount], total: 700, count: 2 }),
			)

			await firstValueFrom(service.create(payload))

			expect(service.bankAccounts()).toEqual([bankAccount, secondAccount])
			expect(service.totalBalance()).toBe(700)
			expect(service.totalAccounts()).toBe(2)
			expect(service.loading()).toBe(false)
			expect(service.hasBankAccounts()).toBe(true)
		})

		it('should propagate error and keep loading true when API fails', async () => {
			mockBankAccounts.create.mockReturnValue(
				throwError(() => new Error('Create failed')),
			)

			await expect(firstValueFrom(service.create(payload))).rejects.toThrow(
				'Create failed',
			)

			expect(service.loading()).toBe(true)
		})
	})

	describe('findById()', () => {
		it('should return the bank account with the given ID', async () => {
			const bankAccount = makeBankAccount({ id: 'w-1', balance: 500 })
			mockBankAccounts.findById.mockReturnValue(of(bankAccount))

			const result = await firstValueFrom(service.findById('w-1'))

			expect(result).toEqual(bankAccount)
			expect(mockBankAccounts.findById).toHaveBeenCalledOnce()
			expect(mockBankAccounts.findById).toHaveBeenCalledWith('w-1')
		})
	})

	describe('update()', () => {
		const bankAccountId = 'w-1'
		const updatePayload = { balance: 1000 }
		const updatedAccount = makeBankAccount({ id: 'w-1', balance: 1000 })

		it('should return the updated bank account', async () => {
			mockBankAccounts.update.mockReturnValue(of(updatedAccount))
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [updatedAccount], total: 1000, count: 1 }),
			)

			const result = await firstValueFrom(
				service.update(bankAccountId, updatePayload),
			)

			expect(result).toEqual(updatedAccount)
			expect(mockBankAccounts.update).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct id and payload', async () => {
			mockBankAccounts.update.mockReturnValue(of(updatedAccount))
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [updatedAccount], total: 1000, count: 1 }),
			)

			await firstValueFrom(service.update(bankAccountId, updatePayload))

			expect(mockBankAccounts.update).toHaveBeenCalledWith(bankAccountId, updatePayload)
		})

		it('should update signals after update', async () => {
			mockBankAccounts.update.mockReturnValue(of(updatedAccount))
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [updatedAccount], total: 1000, count: 1 }),
			)

			await firstValueFrom(service.update(bankAccountId, updatePayload))

			expect(service.bankAccounts()).toEqual([updatedAccount])
			expect(service.totalBalance()).toBe(1000)
			expect(service.totalAccounts()).toBe(1)
			expect(service.loading()).toBe(false)
		})

		it('should propagate error and keep loading true when API fails', async () => {
			mockBankAccounts.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(bankAccountId, updatePayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('delete()', () => {
		const bankAccountId = 'w-1'

		it('should return a success message when deletion is successful', async () => {
			mockBankAccounts.delete.mockReturnValue(
				of({ message: 'Bank account deleted successfully', success: true }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [], total: 0, count: 0 }),
			)

			const result = await firstValueFrom(service.delete(bankAccountId))

			expect(result).toEqual('Bank account deleted successfully')
			expect(mockBankAccounts.delete).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct id', async () => {
			mockBankAccounts.delete.mockReturnValue(
				of({ message: 'Bank account deleted successfully', success: true }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [], total: 0, count: 0 }),
			)

			await firstValueFrom(service.delete(bankAccountId))

			expect(mockBankAccounts.delete).toHaveBeenCalledWith(bankAccountId)
		})

		it('should update signals after deletion', async () => {
			mockBankAccounts.delete.mockReturnValue(
				of({ message: 'Bank account deleted successfully', success: true }),
			)
			mockBankAccounts.findAll.mockReturnValue(
				of({ data: [], total: 0, count: 0 }),
			)

			await firstValueFrom(service.delete(bankAccountId))

			expect(service.bankAccounts()).toEqual([])
			expect(service.totalBalance()).toBe(0)
			expect(service.totalAccounts()).toBe(0)
			expect(service.loading()).toBe(false)
			expect(service.hasBankAccounts()).toBe(false)
		})

		it('should propagate error and keep loading false when API fails', async () => {
			mockBankAccounts.delete.mockReturnValue(
				throwError(() => new Error('Delete failed')),
			)

			await expect(
				firstValueFrom(service.delete(bankAccountId)),
			).rejects.toThrow('Delete failed')

			expect(service.loading()).toBe(false)
		})
	})

	describe('getBalanceHistory()', () => {
		it('should return the balance history for the given account ID', async () => {
			const accountId = 'w-1'
			mockBankAccounts.getBalanceHistory.mockReturnValue(of({ data: [] }))

			const result = await firstValueFrom(service.getBalanceHistory(accountId))

			expect(result).toEqual({ data: [] })
			expect(mockBankAccounts.getBalanceHistory).toHaveBeenCalledOnce()
			expect(mockBankAccounts.getBalanceHistory).toHaveBeenCalledWith(accountId)
		})
	})
})
