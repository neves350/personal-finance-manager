import { TestBed } from '@angular/core/testing'
import { CategoryType } from '@core/api/categories.interface'
import { RecurringsApi } from '@core/api/recurrings.api'
import { FrequencyType, RecurringType } from '@core/api/recurrings.interface'
import { RecurringsService } from '@core/services/recurrings.service'
import { makeRecurring } from '@core/testing/factories'
import { mockRecurrings } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('RecurringsService', () => {
	let service: RecurringsService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: RecurringsApi, useValue: mockRecurrings }],
		})

		service = TestBed.inject(RecurringsService)
	})

	describe('loadRecurrings()', () => {
		it('should return all recurrings and update signals', async () => {
			const firstRecurring = makeRecurring({ id: 'r-1', amount: 20 })
			const secondRecurring = makeRecurring({ id: 'r-2', amount: 50 })

			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [firstRecurring, secondRecurring] }),
			)

			const result = await firstValueFrom(service.loadRecurrings())

			// return value
			expect(result).toEqual([firstRecurring, secondRecurring])

			// API has been called
			expect(mockRecurrings.findAll).toHaveBeenCalledOnce()

			// signals on return response
			expect(service.recurrings()).toEqual([firstRecurring, secondRecurring])
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// derived computed signal
			expect(service.hasRecurrings()).toBe(true)
		})
		it('should clear previous error before a new request', async () => {
			// simulate a previous error already set on the signal
			service.error.set('Previous error')
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [] }))

			await firstValueFrom(service.loadRecurrings())

			// loadRecurrings() calls this.error.set(null) before the request
			expect(service.error()).toBeNull()
		})
		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')

			// throwError() creates an Observable that immediately errors instead of emitting
			mockRecurrings.findAll.mockReturnValue(throwError(() => apiError))

			// firstValueFrom rejects because the observable errored
			await expect(firstValueFrom(service.loadRecurrings())).rejects.toThrow(
				'Network error',
			)

			// tap({ error }) inside loadRecurrings() handles this and updates signals
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.recurrings()).toEqual([])
		})
		it('should fall back to default error message when err.message is missing', async () => {
			// error object without a message property
			mockRecurrings.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(
				firstValueFrom(service.loadRecurrings()),
			).rejects.toBeDefined()

			// service falls back to a hardcoded string when err.message is falsy
			expect(service.error()).toBe('Failed to load recurrings transactions')
		})
	})

	describe('create()', () => {
		const payload = {
			type: RecurringType.INCOME,
			description: 'Recurring 1',
			amount: 100,
			monthDay: 28,
			frequency: FrequencyType.MONTH,
			startDate: new Date(),
			bankAccountId: 'account-1',
			categoryId: 'category-1',
		}
		const recurring = makeRecurring({
			id: 'recurring-1',
			cardId: 'card-1',
			bankAccountId: 'account-1',
			categoryId: 'category-1',
			type: RecurringType.INCOME,
			description: 'Recurring 1',
			amount: 100,
			monthDay: 28,
			frequency: FrequencyType.MONTH,
			startDate: new Date(),
			category: {
				id: 'category-1',
				title: 'Category 1',
				type: CategoryType.INCOME,
			},
			createdAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created recurring', async () => {
			mockRecurrings.create.mockReturnValue(
				of({ recurring, message: 'Recurring created successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [recurring] }))

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(recurring)
			expect(mockRecurrings.create).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct payload', async () => {
			mockRecurrings.create.mockReturnValue(
				of({ recurring, message: 'Recurring created successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [recurring] }))

			await firstValueFrom(service.create(payload))

			expect(mockRecurrings.create).toHaveBeenCalledWith(payload)
		})
		it('should update signals after creation', async () => {
			const secondRecurring = makeRecurring({ id: 'r-2', amount: 10 })
			mockRecurrings.create.mockReturnValue(
				of({ recurring, message: 'Recurring created successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [recurring, secondRecurring] }),
			)

			await firstValueFrom(service.create(payload))

			expect(service.recurrings()).toEqual([recurring, secondRecurring])
			expect(service.loading()).toBe(false)
			expect(service.hasRecurrings()).toBe(true)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockRecurrings.create.mockReturnValue(
				throwError(() => new Error('Create failed')),
			)

			await expect(firstValueFrom(service.create(payload))).rejects.toThrow(
				'Create failed',
			)

			expect(service.loading()).toBe(true)
		})
	})

	describe('update()', () => {
		const recurringId = 'r-1'
		const updatedPayload = { amount: 20 }
		const updatedRecurring = makeRecurring({ id: 'r-1', amount: 20 })

		it('should return the updated recurring', async () => {
			mockRecurrings.update.mockReturnValue(of(updatedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [updatedRecurring] }),
			)

			const result = await firstValueFrom(
				service.update(recurringId, updatedPayload),
			)

			expect(result).toEqual(updatedRecurring)
			expect(mockRecurrings.update).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id and payload', async () => {
			mockRecurrings.update.mockReturnValue(of(updatedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [updatedRecurring] }),
			)

			await firstValueFrom(service.update(recurringId, updatedPayload))

			expect(mockRecurrings.update).toHaveBeenCalledWith(
				recurringId,
				updatedPayload,
			)
		})
		it('should update signals after update', async () => {
			mockRecurrings.update.mockReturnValue(of(updatedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [updatedRecurring] }),
			)

			await firstValueFrom(service.update(recurringId, updatedPayload))

			expect(service.recurrings()).toEqual([updatedRecurring])
			expect(service.loading()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockRecurrings.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(recurringId, updatedPayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('confirm()', () => {
		const recurringId = 'r-1'
		const confirmedRecurring = makeRecurring({ id: 'r-1', autoDetected: false })

		it('should return the confirmed recurring', async () => {
			mockRecurrings.update.mockReturnValue(of(confirmedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [confirmedRecurring] }),
			)

			const result = await firstValueFrom(service.confirm(recurringId))

			expect(result).toEqual(confirmedRecurring)
			expect(mockRecurrings.update).toHaveBeenCalledOnce()
		})
		it('should call update with autoDetected: false', async () => {
			mockRecurrings.update.mockReturnValue(of(confirmedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [confirmedRecurring] }),
			)

			await firstValueFrom(service.confirm(recurringId))

			expect(mockRecurrings.update).toHaveBeenCalledWith(recurringId, {
				autoDetected: false,
			})
		})
		it('should update signals after confirm', async () => {
			mockRecurrings.update.mockReturnValue(of(confirmedRecurring))
			mockRecurrings.findAll.mockReturnValue(
				of({ recurrings: [confirmedRecurring] }),
			)

			await firstValueFrom(service.confirm(recurringId))

			expect(service.recurrings()).toEqual([confirmedRecurring])
			expect(service.loading()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockRecurrings.update.mockReturnValue(
				throwError(() => new Error('Confirm failed')),
			)

			await expect(
				firstValueFrom(service.confirm(recurringId)),
			).rejects.toThrow('Confirm failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('delete()', () => {
		const recurringId = 'r-1'

		it('should return a success message when deletion is successful', async () => {
			mockRecurrings.delete.mockReturnValue(
				of({ message: 'Recurring deleted successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [] }))

			const result = await firstValueFrom(service.delete(recurringId))

			expect(result).toEqual('Recurring deleted successfully')
			expect(mockRecurrings.delete).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id and default deleteTransactions flag', async () => {
			mockRecurrings.delete.mockReturnValue(
				of({ message: 'Recurring deleted successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [] }))

			await firstValueFrom(service.delete(recurringId))

			expect(mockRecurrings.delete).toHaveBeenCalledWith(recurringId, false)
		})
		it('should pass deleteTransactions = true to the API when specified', async () => {
			mockRecurrings.delete.mockReturnValue(
				of({ message: 'Recurring deleted successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [] }))

			await firstValueFrom(service.delete(recurringId, true))

			expect(mockRecurrings.delete).toHaveBeenCalledWith(recurringId, true)
		})
		it('should update signals after deletion', async () => {
			mockRecurrings.delete.mockReturnValue(
				of({ message: 'Recurring deleted successfully' }),
			)
			mockRecurrings.findAll.mockReturnValue(of({ recurrings: [] }))

			await firstValueFrom(service.delete(recurringId))

			expect(service.recurrings()).toEqual([])
			expect(service.loading()).toBe(false)
			expect(service.hasRecurrings()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockRecurrings.delete.mockReturnValue(
				throwError(() => new Error('Delete failed')),
			)

			await expect(
				firstValueFrom(service.delete(recurringId)),
			).rejects.toThrow('Delete failed')

			expect(service.loading()).toBe(true)
		})
	})
})
