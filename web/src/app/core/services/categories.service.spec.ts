import { TestBed } from '@angular/core/testing'
import { CategoriesApi } from '@core/api/categories.api'
import { CategoryType } from '@core/api/categories.interface'
import { CategoriesService } from '@core/services/categories.service'
import { makeCategory } from '@core/testing/factories'
import { mockCategories } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('CategoriesService', () => {
	let service: CategoriesService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: CategoriesApi, useValue: mockCategories }],
		})

		service = TestBed.inject(CategoriesService)
	})

	describe('loadCategories()', () => {
		it('should return all categories and update signals', async () => {
			// Two categories with different types to test computed signals
			const incomeCategory = makeCategory({
				id: 'c-1',
				type: CategoryType.INCOME,
			})
			const expenseCategory = makeCategory({
				id: 'c-2',
				type: CategoryType.EXPENSE,
			})

			// findAll returns Category[] directly (no wrapper like { data, total, count })
			mockCategories.findAll.mockReturnValue(
				of([incomeCategory, expenseCategory]),
			)

			const result = await firstValueFrom(service.loadCategories())

			// return value
			expect(result).toEqual([incomeCategory, expenseCategory])
			expect(mockCategories.findAll).toHaveBeenCalledOnce()

			// signals updated by tap() inside loadCategories()
			expect(service.categories()).toEqual([incomeCategory, expenseCategory])
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// computed signals derived from categories() — filter by type
			expect(service.hasCategories()).toBe(true)
			expect(service.incomeCategories()).toEqual([incomeCategory])
			expect(service.expenseCategories()).toEqual([expenseCategory])
		})

		it('should pass params to the API', async () => {
			const params = { type: CategoryType.EXPENSE }

			// of([]) — findAll returns Observable<Category[]>, so of([]) is a valid
			// empty emission. We don't care about the response here, only the call args.
			mockCategories.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCategories(params))

			// verify params were forwarded to the API
			expect(mockCategories.findAll).toHaveBeenCalledWith(params)
		})

		it('should call the API without params when none provided', async () => {
			mockCategories.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCategories())

			// loadCategories() has params as optional, so it passes undefined when omitted
			expect(mockCategories.findAll).toHaveBeenCalledWith(undefined)
		})

		it('should clear previous error before a new request', async () => {
			// simulate a previous error already set on the signal
			service.error.set('Previous error')
			mockCategories.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCategories())

			// loadCategories() calls this.error.set(null) before the request
			expect(service.error()).toBeNull()
		})

		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')

			// throwError() creates an Observable that immediately errors instead of emitting
			mockCategories.findAll.mockReturnValue(throwError(() => apiError))

			// firstValueFrom rejects because the observable errored
			await expect(firstValueFrom(service.loadCategories())).rejects.toThrow(
				'Network error',
			)

			// tap({ error }) inside loadCategories() handles this and updates signals
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.categories()).toEqual([])
		})

		it('should fall back to default error message when err.message is missing', async () => {
			// error object without a message property
			mockCategories.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(
				firstValueFrom(service.loadCategories()),
			).rejects.toBeDefined()

			// service falls back to a hardcoded string when err.message is falsy
			expect(service.error()).toBe('Failed to load categories')
		})
	})

	describe('create()', () => {
		/**
		 * Note:
		 * Doesn't call .findAll() because don't have any switchMap() like has on BankAccountsService
		 */
		const payload = {
			title: 'Category 1',
			icon: 'phone',
			color: 'BLUE',
			type: CategoryType.EXPENSE,
		}
		const category = makeCategory({
			id: 'c-1',
			title: 'Category 1',
			type: CategoryType.EXPENSE,
			color: 'BLUE',
			icon: 'phone',
			isDefault: false,
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created category', async () => {
			mockCategories.create.mockReturnValue(
				of({ category, message: 'Category created successfully' }),
			)

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(category)
			expect(mockCategories.create).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct payload', async () => {
			mockCategories.create.mockReturnValue(
				of({ category, message: 'Category created successfully' }),
			)

			await firstValueFrom(service.create(payload))

			expect(mockCategories.create).toHaveBeenCalledWith(payload)
		})

		it('should append the new category to the existing list', async () => {
			// pre-set an existing category in the signal
			const incomeCategory = makeCategory({
				id: 'c-0',
				type: CategoryType.INCOME,
			})
			service.categories.set([incomeCategory])

			mockCategories.create.mockReturnValue(
				of({ category, message: 'Category created successfully' }),
			)

			await firstValueFrom(service.create(payload))

			// create() uses categories.update(current => [...current, category])
			// so it appends — never calls findAll
			expect(service.categories()).toEqual([incomeCategory, category])
			expect(service.loading()).toBe(false)
			expect(service.hasCategories()).toBe(true)
			expect(service.incomeCategories()).toEqual([incomeCategory])
			expect(service.expenseCategories()).toEqual([category])
		})

		it('should set error signal and reset loading when API fails', async () => {
			mockCategories.create.mockReturnValue(
				throwError(() => new Error('Create failed')),
			)

			await expect(firstValueFrom(service.create(payload))).rejects.toThrow(
				'Create failed',
			)

			// tap({ error }) resets loading and sets the error signal
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Create failed')
		})
	})

	describe('findById()', () => {
		it('should return the category with the given ID', async () => {
			const category = makeCategory({ id: 'c-1', type: CategoryType.INCOME })
			mockCategories.findById.mockReturnValue(of(category))

			const result = await firstValueFrom(service.findById('c-1'))

			expect(result).toEqual(category)
			expect(mockCategories.findById).toHaveBeenCalledOnce()
			expect(mockCategories.findById).toHaveBeenCalledWith('c-1')
		})
	})

	describe('update()', () => {
		const categoryId = 'c-1'
		const updatePayload = { type: CategoryType.EXPENSE }
		const updatedCategory = makeCategory({
			id: 'c-1',
			type: CategoryType.EXPENSE,
		})

		it('should return the updated category', async () => {
			mockCategories.update.mockReturnValue(of(updatedCategory))
			mockCategories.findAll.mockReturnValue(of([updatedCategory]))

			const result = await firstValueFrom(
				service.update(categoryId, updatePayload),
			)

			expect(result).toEqual(updatedCategory)
			expect(mockCategories.update).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct id and payload', async () => {
			mockCategories.update.mockReturnValue(of(updatedCategory))
			mockCategories.findAll.mockReturnValue(of([updatedCategory]))

			await firstValueFrom(service.update(categoryId, updatePayload))

			expect(mockCategories.update).toHaveBeenCalledWith(
				categoryId,
				updatePayload,
			)
		})

		it('should update signals after update', async () => {
			mockCategories.update.mockReturnValue(of(updatedCategory))
			mockCategories.findAll.mockReturnValue(of([updatedCategory]))

			await firstValueFrom(service.update(categoryId, updatePayload))

			expect(service.loading()).toBe(false)
			expect(service.categories()).toEqual([updatedCategory])
		})

		it('should propagate error and keep loading true when API fails', async () => {
			mockCategories.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(categoryId, updatePayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('delete()', () => {
		const categoryId = 'c-1'

		it('should return a success message when deletion is successful', async () => {
			mockCategories.delete.mockReturnValue(
				of({ message: 'Category deleted successfully', success: true }),
			)
			mockCategories.findAll.mockReturnValue(of([]))

			const result = await firstValueFrom(service.delete(categoryId))

			expect(result).toEqual('Category deleted successfully')
			expect(mockCategories.delete).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct id', async () => {
			mockCategories.delete.mockReturnValue(
				of({ message: 'Category deleted successfully', success: true }),
			)
			mockCategories.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.delete(categoryId))

			expect(mockCategories.delete).toHaveBeenCalledWith(categoryId)
		})

		it('should update signals after deletion', async () => {
			mockCategories.delete.mockReturnValue(
				of({ message: 'Category deleted successfully', success: true }),
			)
			mockCategories.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.delete(categoryId))

			expect(service.hasCategories()).toBe(false)
			expect(service.loading()).toBe(false)
			expect(service.incomeCategories()).toEqual([])
			expect(service.expenseCategories()).toEqual([])
		})

		it('should propagate error and keep loading false when API fails', async () => {
			mockCategories.delete.mockReturnValue(
				throwError(() => new Error('Delete failed')),
			)

			await expect(firstValueFrom(service.delete(categoryId))).rejects.toThrow(
				'Delete failed',
			)

			expect(service.loading()).toBe(false)
		})
	})
})
