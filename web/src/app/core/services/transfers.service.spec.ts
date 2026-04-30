import { TestBed } from '@angular/core/testing'
import { TransfersApi } from '@core/api/transfers.api'
import { TransferStatus } from '@core/api/transfers.interface'
import { TransfersService } from '@core/services/transfers.service'
import { makeTransfer } from '@core/testing/factories'
import { mockTransfers } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('TransfersService', () => {
	let service: TransfersService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: TransfersApi, useValue: mockTransfers }],
		})

		service = TestBed.inject(TransfersService)
	})

	describe('loadTransfers()', () => {
		it('should return all transfers and update signals', async () => {
			// Two transfers with different types to test computed signals
			const firstTransfer = makeTransfer({
				id: 't-1',
				status: TransferStatus.COMPLETED,
			})
			const secondTransfer = makeTransfer({
				id: 't-2',
				status: TransferStatus.COMPLETED,
			})

			mockTransfers.findAll.mockReturnValue(
				of({ data: [firstTransfer, secondTransfer] }),
			)

			const result = await firstValueFrom(service.loadTransfers())

			// return value
			expect(result).toEqual([firstTransfer, secondTransfer])
			expect(mockTransfers.findAll).toHaveBeenCalledOnce()

			// signals updated by tap() inside loadTransfers()
			expect(service.transfers()).toEqual([firstTransfer, secondTransfer])
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// computed signals derived from transfers() — filter by type
			expect(service.hasTransfers()).toBe(true)
		})
		it('should pass params to the API', async () => {
			const params = { status: TransferStatus.COMPLETED }

			mockTransfers.findAll.mockReturnValue(of({ data: [] }))

			await firstValueFrom(service.loadTransfers(params))

			// verify params were forwarded to the API
			expect(mockTransfers.findAll).toHaveBeenCalledWith(params)
		})
		it('should call the API without params when none provided', async () => {
			mockTransfers.findAll.mockReturnValue(of({ data: [] }))

			await firstValueFrom(service.loadTransfers())

			// loadTransfers() has params as optional, so it passes undefined when omitted
			expect(mockTransfers.findAll).toHaveBeenCalledWith(undefined)
		})
		it('should clear previous error before a new request', async () => {
			// simulate a previous error already set on the signal
			service.error.set('Previous error')
			mockTransfers.findAll.mockReturnValue(of({ data: [] }))

			await firstValueFrom(service.loadTransfers())

			// loadTransfers() calls this.error.set(null) before the request
			expect(service.error()).toBeNull()
		})
		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')

			// throwError() creates an Observable that immediately errors instead of emitting
			mockTransfers.findAll.mockReturnValue(throwError(() => apiError))

			// firstValueFrom rejects because the observable errored
			await expect(firstValueFrom(service.loadTransfers())).rejects.toThrow(
				'Network error',
			)

			// tap({ error }) inside loadTransfers() handles this and updates signals
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.transfers()).toEqual([])
		})
		it('should fall back to default error message when err.message is missing', async () => {
			// error object without a message property
			mockTransfers.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(
				firstValueFrom(service.loadTransfers()),
			).rejects.toBeDefined()

			// service falls back to a hardcoded string when err.message is falsy
			expect(service.error()).toBe('Failed to load transfers')
		})
	})

	describe('create()', () => {
		const payload = {
			amount: 50,
			fromAccountId: 'account-1',
			toAccountId: 'account-2',
			date: new Date(),
		}
		const transfer = makeTransfer({
			id: 't-1',
			amount: 50,
			fromAccountId: 'account-1',
			toAccountId: 'account-2',
			date: new Date(),
			description: 'Transfer 1',
			status: TransferStatus.COMPLETED,
			createdAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created transfer', async () => {
			mockTransfers.create.mockReturnValue(
				of({ transfer, message: 'Transfer created successfully' }),
			)
			mockTransfers.findAll.mockReturnValue(of({ data: [transfer] }))

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(transfer)
			expect(mockTransfers.create).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct payload', async () => {
			mockTransfers.create.mockReturnValue(
				of({ transfer, message: 'Transfer created successfully' }),
			)
			mockTransfers.findAll.mockReturnValue(of({ data: [transfer] }))

			await firstValueFrom(service.create(payload))

			expect(mockTransfers.create).toHaveBeenCalledWith(payload)
		})
		it('should update signals after creation', async () => {
			const secondTransfer = makeTransfer({ id: 't-2', amount: 100 })
			mockTransfers.create.mockReturnValue(
				of({ transfer, message: 'Transfer created successfully' }),
			)
			mockTransfers.findAll.mockReturnValue(
				of({ data: [transfer, secondTransfer] }),
			)

			await firstValueFrom(service.create(payload))

			expect(service.transfers()).toEqual([transfer, secondTransfer])
			expect(service.loading()).toBe(false)
			expect(service.hasTransfers()).toBe(true)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockTransfers.create.mockReturnValue(
				throwError(() => new Error('Create failed')),
			)

			await expect(firstValueFrom(service.create(payload))).rejects.toThrow(
				'Create failed',
			)

			expect(service.loading()).toBe(true)
		})
	})

	describe('findById()', () => {
		it('should return the transfer with the given ID', async () => {
			const transfer = makeTransfer({ id: 't-1', amount: 100 })
			mockTransfers.findById.mockReturnValue(of(transfer))

			const result = await firstValueFrom(service.findById('t-1'))

			expect(result).toEqual(transfer)
			expect(mockTransfers.findById).toHaveBeenCalledOnce()
			expect(mockTransfers.findById).toHaveBeenCalledWith('t-1')
		})
	})
})
