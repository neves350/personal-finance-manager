import { TestBed } from '@angular/core/testing'
import { BankType } from '@core/api/bank-accounts.interface'
import { CategoryType } from '@core/api/categories.interface'
import { GoalsApi } from '@core/api/goals.api'
import { GoalType } from '@core/api/goals.interface'
import { GoalsService } from '@core/services/goals.service'
import { makeDeposit, makeGoal } from '@core/testing/factories'
import { mockGoals } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('GoalsService', () => {
	let service: GoalsService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: GoalsApi, useValue: mockGoals }],
		})

		service = TestBed.inject(GoalsService)
	})

	describe('loadGoals()', () => {
		it('should return all goals and update signals', async () => {
			const firstGoal = makeGoal({
				id: 'g-1',
				type: GoalType.SAVINGS,
				isCompleted: true,
			})
			const secondGoal = makeGoal({
				id: 'g-2',
				type: GoalType.SPENDING_LIMIT,
				isCompleted: false,
			})

			mockGoals.findAll.mockReturnValue(of([firstGoal, secondGoal]))

			const result = await firstValueFrom(service.loadGoals())

			// return value
			expect(result).toEqual([firstGoal, secondGoal])

			// API has been called
			expect(mockGoals.findAll).toHaveBeenCalledOnce()

			// signals on return response
			expect(service.goals()).toEqual([firstGoal, secondGoal])
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// computed signals derived from goals() — filter by type
			expect(service.hasGoals()).toBe(true)
			expect(service.activeGoals()).toEqual([secondGoal])
			expect(service.completedGoals()).toEqual([firstGoal])
		})
		it('should clear previous error before a new request', async () => {
			// simulate a previous error already set on the signal
			service.error.set('Previous error')
			mockGoals.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadGoals())

			// loadGoals() calls this.error.set(null) before the request
			expect(service.error()).toBeNull()
		})
		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')

			// throwError() creates an Observable that immediately errors instead of emitting
			mockGoals.findAll.mockReturnValue(throwError(() => apiError))

			// firstValueFrom rejects because the observable errored
			await expect(firstValueFrom(service.loadGoals())).rejects.toThrow(
				'Network error',
			)

			// tap({ error }) inside loadGoals() handles this and updates signals
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.goals()).toEqual([])
		})
		it('should fall back to default error message when err.message is missing', async () => {
			// error object without a message property
			mockGoals.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(firstValueFrom(service.loadGoals())).rejects.toBeDefined()

			// service falls back to a hardcoded string when err.message is falsy
			expect(service.error()).toBe('Failed to load goals')
		})
	})

	describe('create()', () => {
		const payload = {
			title: 'Goal 1',
			amount: 100,
			type: GoalType.SAVINGS,
			startDate: '2026-01-01T00:00:00.000Z',
		}
		const goal = makeGoal({
			id: 'goal-1',
			title: 'Goal 1',
			amount: 500,
			currentAmount: 100,
			type: GoalType.SAVINGS,
			startDate: '2026-01-01T00:00:00.000Z',
			progress: 60,
			isCompleted: false,
			paceStatus: 'ON_TRACK',
			breakdown: {
				daily: 10,
				weekly: 70,
				monthly: 280,
				daysRemaining: 20,
			},
			category: {
				id: 'c-1',
				title: 'Category 1',
				icon: 'text',
				type: CategoryType.EXPENSE,
			},
			bankAccount: {
				id: 'b-1',
				name: 'Bank Account 1',
				type: BankType.CHECKING,
			},
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z',
		})

		it('should return the created goal', async () => {
			mockGoals.create.mockReturnValue(
				of({ goal, message: 'Goal created successfully' }),
			)

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(goal)
			expect(mockGoals.create).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct payload', async () => {
			mockGoals.create.mockReturnValue(
				of({ goal, message: 'Goal created successfully' }),
			)

			await firstValueFrom(service.create(payload))

			expect(mockGoals.create).toHaveBeenCalledWith(payload)
		})
		it('should append the new goal to the existing list', async () => {
			// pre-set an existing goal in the signal
			const savingGoal = makeGoal({
				id: 'g-0',
				type: GoalType.SAVINGS,
			})
			service.goals.set([savingGoal])

			mockGoals.create.mockReturnValue(
				of({ goal, message: 'Goal created successfully' }),
			)

			await firstValueFrom(service.create(payload))

			// create() uses goals.update(current => [...current, goal])
			// so it appends — never calls findAll
			expect(service.goals()).toEqual([savingGoal, goal])
			expect(service.loading()).toBe(false)
			expect(service.hasGoals()).toBe(true)
		})
		it('should set error signal and reset loading when API fails', async () => {
			mockGoals.create.mockReturnValue(
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
		it('should return the goal with the given Id', async () => {
			const goal = makeGoal({
				id: 'g-1',
				type: GoalType.SAVINGS,
			})
			mockGoals.findById.mockReturnValue(of(goal))

			const result = await firstValueFrom(service.findById('g-1'))

			expect(result).toEqual(goal)
			expect(mockGoals.findById).toHaveBeenCalledOnce()
			expect(mockGoals.findById).toHaveBeenCalledWith('g-1')
		})
	})

	describe('update()', () => {
		const goalId = 'g-1'
		const updatedPayload = { amount: 1000 }
		const updatedGoal = makeGoal({ id: 'g-1', amount: 1000 })

		it('should return the updated goal', async () => {
			mockGoals.update.mockReturnValue(of(updatedGoal))
			mockGoals.findAll.mockReturnValue(of([updatedGoal]))

			const result = await firstValueFrom(
				service.update(goalId, updatedPayload),
			)

			expect(result).toEqual(updatedGoal)
			expect(mockGoals.update).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id and payload', async () => {
			mockGoals.update.mockReturnValue(of(updatedGoal))
			mockGoals.findAll.mockReturnValue(of([updatedGoal]))

			await firstValueFrom(service.update(goalId, updatedPayload))

			expect(mockGoals.update).toHaveBeenCalledWith(goalId, updatedPayload)
		})
		it('should update signals after update', async () => {
			mockGoals.update.mockReturnValue(of(updatedGoal))
			mockGoals.findAll.mockReturnValue(of([updatedGoal]))

			await firstValueFrom(service.update(goalId, updatedPayload))

			expect(service.goals()).toEqual([updatedGoal])
			expect(service.loading()).toBe(false)
		})
		it('should propagate error and keep loading true when API fails', async () => {
			mockGoals.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(goalId, updatedPayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(true)
		})
	})

	describe('delete()', () => {
		const goalId = 'g-1'

		it('should return a success message when deletion is successful', async () => {
			mockGoals.delete.mockReturnValue(
				of({ message: 'Goal deleted successfully', success: true }),
			)
			mockGoals.findAll.mockReturnValue(of([]))

			const result = await firstValueFrom(service.delete(goalId))

			expect(result).toEqual('Goal deleted successfully')
			expect(mockGoals.delete).toHaveBeenCalledOnce()
		})
		it('should call the API with the correct id', async () => {
			mockGoals.delete.mockReturnValue(
				of({ message: 'Goal deleted successfully', success: true }),
			)
			mockGoals.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.delete(goalId))

			expect(mockGoals.delete).toHaveBeenCalledWith(goalId)
		})
		it('should update signals after deletion', async () => {
			mockGoals.delete.mockReturnValue(
				of({ message: 'Goal deleted successfully', success: true }),
			)
			mockGoals.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.delete(goalId))

			expect(service.goals()).toEqual([])
			expect(service.loading()).toBe(false)
			expect(service.hasGoals()).toBe(false)
		})
		it('should propagate error and keep loading false when API fails', async () => {
			mockGoals.delete.mockReturnValue(
				throwError(() => new Error('Delete failed')),
			)

			await expect(firstValueFrom(service.delete(goalId))).rejects.toThrow(
				'Delete failed',
			)

			expect(service.loading()).toBe(false)
		})
	})

	describe('addDeposit()', () => {
		const goalId = 'g-1'
		const payload = { amount: 50, date: '2026-01-01T00:00:00.000Z' }
		const deposit = makeDeposit({ id: 'd-1', goalId: 'g-1', amount: 50 })
		const updatedGoal = makeGoal({
			id: 'g-1',
			currentAmount: 150,
			progress: 80,
		})

		it('should return the created deposit', async () => {
			mockGoals.addDeposit.mockReturnValue(
				of({
					deposit,
					goal: updatedGoal,
					message: 'Deposit added successfully',
				}),
			)

			const result = await firstValueFrom(service.addDeposit(goalId, payload))

			expect(result).toEqual(deposit)
			expect(mockGoals.addDeposit).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct goalId and payload', async () => {
			mockGoals.addDeposit.mockReturnValue(
				of({
					deposit,
					goal: updatedGoal,
					message: 'Deposit added successfully',
				}),
			)

			await firstValueFrom(service.addDeposit(goalId, payload))

			expect(mockGoals.addDeposit).toHaveBeenCalledWith(goalId, payload)
		})

		it('should replace the goal in the list and increment depositsVersion', async () => {
			const originalGoal = makeGoal({ id: 'g-1', currentAmount: 100 })
			const otherGoal = makeGoal({ id: 'g-2' })
			// pre-set two goals — only the one matching goalId should be replaced
			service.goals.set([originalGoal, otherGoal])

			mockGoals.addDeposit.mockReturnValue(
				of({
					deposit,
					goal: updatedGoal,
					message: 'Deposit added successfully',
				}),
			)

			await firstValueFrom(service.addDeposit(goalId, payload))

			// tap.next replaces matching goal by id — other goals untouched
			expect(service.goals()).toEqual([updatedGoal, otherGoal])
			expect(service.depositsVersion()).toBe(1)
			expect(service.loading()).toBe(false)
		})

		it('should set error signal and reset loading when API fails', async () => {
			mockGoals.addDeposit.mockReturnValue(
				throwError(() => new Error('Add deposit failed')),
			)

			await expect(
				firstValueFrom(service.addDeposit(goalId, payload)),
			).rejects.toThrow('Add deposit failed')

			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Add deposit failed')
		})
	})

	describe('getDeposits()', () => {
		it('should return all deposits with the given goalId', async () => {
			const goalId = 'g-1'
			const depositsResponse = {
				goalId: 'g-1',
				totalDeposits: 1,
				totalAmount: 100,
				deposits: [makeDeposit({ goalId: 'g-1' })],
			}
			mockGoals.getDeposits.mockReturnValue(of(depositsResponse))

			const result = await firstValueFrom(service.getDeposits(goalId))

			expect(result).toEqual(depositsResponse)
			expect(mockGoals.getDeposits).toHaveBeenCalledOnce()
			expect(mockGoals.getDeposits).toHaveBeenCalledWith(goalId)
		})
	})
})
