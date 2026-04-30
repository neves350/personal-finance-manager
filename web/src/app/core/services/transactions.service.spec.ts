import { TestBed } from '@angular/core/testing'
import { CategoryType } from '@core/api/categories.interface'
import { TransactionsApi } from '@core/api/transactions.api'
import { TransactionType } from '@core/api/transactions.interface'
import { TransactionsService } from '@core/services/transactions.service'
import { makeTransaction } from '@core/testing/factories'
import { mockTransactions } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('TransactionsService', () => {
	let service: TransactionsService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: TransactionsApi, useValue: mockTransactions }],
		})

		service = TestBed.inject(TransactionsService)
	})

	describe('loadTransactions()', () => {
		it('should return all transactions and update signals', async () => {
			const firstTransaction = makeTransaction({ id: 'w-1', amount: 10 })
			const secondTransaction = makeTransaction({ id: 'w-2', amount: 20 })
			const meta = { total: 2, lastPage: 1, currentPage: 1, perPage: 10, prev: null, next: null }
			const apiResponse = {
				data: [firstTransaction, secondTransaction],
				meta,
			}
			mockTransactions.findAll.mockReturnValue(of(apiResponse))

			const result = await firstValueFrom(service.loadTransactions())

			// return value
			expect(result).toEqual([firstTransaction, secondTransaction])

			// API has been called
			expect(mockTransactions.findAll).toHaveBeenCalledOnce()

			// signals on return response
			expect(service.transactions()).toEqual([
				firstTransaction,
				secondTransaction,
			])
			expect(service.paginationMeta()).toEqual(meta)
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// derived computed signal
			expect(service.hasTransactions()).toBe(true)
		})
		it('should pass params to the API', async () => {
			const params = { type: TransactionType.EXPENSE }
			mockTransactions.findAll.mockReturnValue(of({ data: [], meta: null }))

			await firstValueFrom(service.loadTransactions(params))

			// loadTransactions() merges params with a dateRange — use objectContaining
			// to verify params were forwarded without caring about the date fields
			expect(mockTransactions.findAll).toHaveBeenCalledWith(
				expect.objectContaining(params),
			)
			expect(service.activeFilters()).toEqual(params)
		})
		it('should always include date range in the API call', async () => {
			mockTransactions.findAll.mockReturnValue(of({ data: [], meta: null }))

			await firstValueFrom(service.loadTransactions())

			// loadTransactions() always merges { startDate, endDate } from getMonthDateRange()
			expect(mockTransactions.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					startDate: expect.any(String),
					endDate: expect.any(String),
				}),
			)
			expect(service.activeFilters()).toEqual({})
		})
		it('should clear previous error before a new request', async () => {
			service.error.set('Previous error')
			mockTransactions.findAll.mockReturnValue(
				of({
					data: [],
					meta: null,
				}),
			)

			await firstValueFrom(service.loadTransactions())

			expect(service.error()).toBeNull()
		})
		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')
			mockTransactions.findAll.mockReturnValue(throwError(() => apiError))

			// the observable propagates the error
			await expect(firstValueFrom(service.loadTransactions())).rejects.toThrow(
				'Network error',
			)

			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.transactions()).toEqual([])
		})
		it('should fall back to default error message when err.message is missing', async () => {
			mockTransactions.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(
				firstValueFrom(service.loadTransactions()),
			).rejects.toBeDefined()

			expect(service.error()).toBe('Failed to load transactions')
		})
	})

	describe('create()', () => {
		const payload = {
			title: 'Transaction 1',
			type: TransactionType.EXPENSE,
			amount: 100,
			date: new Date(),
			bankAccountId: 'b-1',
			categoryId: 'c-1',
		}
		const transaction = makeTransaction({
			id: 't-1',
			title: 'Transaction 1',
			type: TransactionType.EXPENSE,
			amount: 100,
			date: new Date(),
			category: {
				id: 'c-1',
				title: 'Category 1',
				icon: 'phone',
				type: CategoryType.EXPENSE,
			},
			isPaid: true,
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created transaction', async () => {
			mockTransactions.create.mockReturnValue(
				of({ transaction, message: 'Transaction created successfully' }),
			)
			mockTransactions.findAll.mockReturnValue(
				of({ data: [transaction], meta: null }),
			)

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(transaction)
			expect(mockTransactions.create).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct payload', async () => {
			mockTransactions.create.mockReturnValue(
				of({ transaction, message: 'Transaction created successfully' }),
			)
			mockTransactions.findAll.mockReturnValue(
				of({ data: [transaction], meta: null }),
			)

			await firstValueFrom(service.create(payload))

			expect(mockTransactions.create).toHaveBeenCalledWith(payload)
		})
		it('should trigger loadTransactions() and update signals', async () => {
			const secondTransaction = makeTransaction({ id: 't-2', amount: 50 })
			mockTransactions.create.mockReturnValue(
				of({ transaction, message: 'Transaction created successfully' }),
			)
			mockTransactions.findAll.mockReturnValue(
				of({ data: [transaction, secondTransaction], meta: null }),
			)

			await firstValueFrom(service.create(payload))

			expect(service.transactions()).toEqual([transaction, secondTransaction])
			expect(service.paginationMeta()).toBe(null)
			expect(service.loading()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockTransactions.create.mockReturnValue(
				throwError(() => new Error('Create failed')),
			)

			await expect(firstValueFrom(service.create(payload))).rejects.toThrow(
				'Create failed',
			)

			expect(service.loading()).toBe(true)
		})
	})

	describe('findById()', () => {
		it('should return the transaction with the given Id', async () => {
			const transaction = makeTransaction({
				id: 'c-1',
				type: TransactionType.EXPENSE,
			})
			mockTransactions.findById.mockReturnValue(of(transaction))

			const result = await firstValueFrom(service.findById('t-1'))

			expect(result).toEqual(transaction)
			expect(mockTransactions.findById).toHaveBeenCalledOnce()
			expect(mockTransactions.findById).toHaveBeenCalledWith('t-1')
		})
	})

	describe('update()', () => {
		const transactionId = 't-1'
		const updatedPayload = { amount: 50 }
		const updatedTransaction = makeTransaction({ id: 't-1', amount: 50 })

		it('should return the updated transaction', async () => {
			mockTransactions.update.mockReturnValue(of(updatedTransaction))
			mockTransactions.findAll.mockReturnValue(
				of({ data: [updatedTransaction], meta: null }),
			)

			const result = await firstValueFrom(
				service.update(transactionId, updatedPayload),
			)

			expect(result).toEqual(updatedTransaction)
			expect(mockTransactions.update).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id and payload', async () => {
			mockTransactions.update.mockReturnValue(of(updatedTransaction))
			mockTransactions.findAll.mockReturnValue(
				of({ data: [updatedTransaction], meta: null }),
			)

			await firstValueFrom(service.update(transactionId, updatedPayload))

			expect(mockTransactions.update).toHaveBeenCalledWith(
				transactionId,
				updatedPayload,
			)
		})
		it('should update signals after update', async () => {
			mockTransactions.update.mockReturnValue(of(updatedTransaction))
			mockTransactions.findAll.mockReturnValue(
				of({ data: [updatedTransaction], meta: null }),
			)

			await firstValueFrom(service.update(transactionId, updatedPayload))

			expect(service.transactions()).toEqual([updatedTransaction])
			expect(service.loading()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockTransactions.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(transactionId, updatedPayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('delete()', () => {
		const transactionId = 't-1'

		it('should return a success message when deletion is successful', async () => {
			mockTransactions.delete.mockReturnValue(
				of({ message: 'Transaction deleted successfully', success: true }),
			)
			mockTransactions.findAll.mockReturnValue(of({ data: [], meta: null }))

			const result = await firstValueFrom(service.delete(transactionId))

			expect(result).toEqual('Transaction deleted successfully')
			expect(mockTransactions.delete).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id', async () => {
			mockTransactions.delete.mockReturnValue(
				of({ message: 'Transaction deleted successfully', success: true }),
			)
			mockTransactions.findAll.mockReturnValue(of({ data: [], meta: null }))

			await firstValueFrom(service.delete(transactionId))

			expect(mockTransactions.delete).toHaveBeenCalledWith(transactionId)
		})
		it('should update signals after deletion', async () => {
			mockTransactions.delete.mockReturnValue(
				of({ message: 'Transaction deleted successfully', success: true }),
			)
			mockTransactions.findAll.mockReturnValue(of({ data: [], meta: null }))

			await firstValueFrom(service.delete(transactionId))

			expect(service.transactions()).toEqual([])
			expect(service.paginationMeta()).toBe(null)
			expect(service.loading()).toBe(false)
			expect(service.activeFilters()).toEqual({})
			expect(service.selectedYear()).toEqual(new Date().getFullYear())
			expect(service.selectedMonth()).toEqual(new Date().getMonth())
			// computed signals
			expect(service.monthLabel()).toEqual(
				new Date(
					service.selectedYear(),
					service.selectedMonth(),
				).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
			)
			expect(service.hasTransactions()).toBe(false)
			expect(service.monthSummary()).toEqual({
				income: 0,
				expenses: 0,
				balance: 0,
			})
			expect(service.groupedTransactions()).toEqual([])
		})
		it('should propagate error and keep loading false when API fails', async () => {
			mockTransactions.delete.mockReturnValue(
				throwError(() => new Error('Delete failed')),
			)

			await expect(
				firstValueFrom(service.delete(transactionId)),
			).rejects.toThrow('Delete failed')

			expect(service.loading()).toBe(false)
		})
	})
})
