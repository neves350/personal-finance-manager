import { TestBed } from '@angular/core/testing'
import { CardsApi } from '@core/api/cards.api'
import { CardColor, CardType } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import { makeCard } from '@core/testing/factories'
import { mockCards } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('CardsService', () => {
	let service: CardsService

	beforeEach(() => {
		vi.clearAllMocks() // clear all mocks before tests

		TestBed.configureTestingModule({
			providers: [{ provide: CardsApi, useValue: mockCards }],
		})

		service = TestBed.inject(CardsService)
	})

	describe('loadCards()', () => {
		it('should return all cards and update signals', async () => {
			const creditCard = makeCard({
				id: 'c-1',
				type: CardType.CREDIT_CARD,
			})
			const debitCard = makeCard({
				id: 'c-2',
				type: CardType.DEBIT_CARD,
			})

			// findAll returns Card[] directly
			mockCards.findAll.mockReturnValue(of([creditCard, debitCard]))

			const result = await firstValueFrom(service.loadCards())

			// return value
			expect(result).toEqual([creditCard, debitCard])
			expect(mockCards.findAll).toHaveBeenCalledOnce()

			// signals updated by tap() inside loadCards()
			expect(service.cards()).toEqual([creditCard, debitCard])
			expect(service.loading()).toBe(false)
			expect(service.error()).toBeNull()

			// computed signals derived from cards() — filter by type
			expect(service.hasCards()).toBe(true)
			expect(service.creditCardsCount()).toBe(1)
			expect(service.hasCreditCards()).toBe(true)
			expect(service.creditCards()).toEqual([creditCard])
		})

		it('should pass bankAccountId to the API', async () => {
			const bankAccountId = 'account-1'

			// of([]) — findAll returns Observable<Card[]>, so of([]) is a valid
			// empty emission. We don't care about the response here, only the call args.
			mockCards.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCards(bankAccountId))

			// verify params were forwarded to the API
			expect(mockCards.findAll).toHaveBeenCalledWith(bankAccountId)
		})

		it('should call the API without bankAccountId when none provided', async () => {
			mockCards.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCards())

			// loadCards() has params as optional, so it passes undefined when omitted
			expect(mockCards.findAll).toHaveBeenCalledWith(undefined)
		})

		it('should clear previous error before a new request', async () => {
			// simulate a previous error already set on the signal
			service.error.set('Previous error')
			mockCards.findAll.mockReturnValue(of([]))

			await firstValueFrom(service.loadCards())

			// loadCards() calls this.error.set(null) before the request
			expect(service.error()).toBeNull()
		})

		it('should set error signal and reset loading when API fails', async () => {
			const apiError = new Error('Network error')

			// throwError() creates an Observable that immediately errors instead of emitting
			mockCards.findAll.mockReturnValue(throwError(() => apiError))

			// firstValueFrom rejects because the observable errored
			await expect(firstValueFrom(service.loadCards())).rejects.toThrow(
				'Network error',
			)

			// tap({ error }) inside loadCards() handles this and updates signals
			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Network error')
			expect(service.cards()).toEqual([])
		})

		it('should fall back to default error message when err.message is missing', async () => {
			// error object without a message property
			mockCards.findAll.mockReturnValue(
				throwError(() => ({ message: undefined })),
			)

			await expect(firstValueFrom(service.loadCards())).rejects.toBeDefined()

			// service falls back to a hardcoded string when err.message is falsy
			expect(service.error()).toBe('Failed to load cards')
		})
	})

	describe('create()', () => {
		const payload = {
			name: 'My Card',
			color: CardColor.BLUE,
			type: CardType.CREDIT_CARD,
		}
		const card = makeCard({
			id: 'c-1',
			name: 'My Card',
			color: CardColor.BLUE,
			type: CardType.CREDIT_CARD,
		})

		it('should return the created card', async () => {
			mockCards.create.mockReturnValue(
				of({ card, message: 'Card created successfully' }),
			)
			// needed because tap.next calls this.loadCards().subscribe() as a side effect
			mockCards.findAll.mockReturnValue(of([card]))

			const result = await firstValueFrom(service.create(payload))

			expect(result).toEqual(card)
			expect(mockCards.create).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct payload', async () => {
			mockCards.create.mockReturnValue(
				of({ card, message: 'Card created successfully' }),
			)
			mockCards.findAll.mockReturnValue(of([card]))

			await firstValueFrom(service.create(payload))

			expect(mockCards.create).toHaveBeenCalledWith(payload)
		})

		it('should trigger loadCards() as a side effect and reset loading', async () => {
			mockCards.create.mockReturnValue(
				of({ card, message: 'Card created successfully' }),
			)
			mockCards.findAll.mockReturnValue(of([card]))

			await firstValueFrom(service.create(payload))

			// tap.next calls this.loadCards().subscribe() — fire-and-forget, not switchMap
			expect(mockCards.findAll).toHaveBeenCalledOnce()
			expect(service.loading()).toBe(false)
		})

		it('should set error signal and reset loading when API fails', async () => {
			mockCards.create.mockReturnValue(
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

	describe('update()', () => {
		const cardId = 'c-1'
		const updatePayload = { name: 'Updated Card' }
		const updatedCard = makeCard({
			id: 'c-1',
			name: 'Updated Card',
			type: CardType.CREDIT_CARD,
		})

		it('should return the updated card', async () => {
			mockCards.update.mockReturnValue(of(updatedCard))

			const result = await firstValueFrom(service.update(cardId, updatePayload))

			expect(result).toEqual(updatedCard)
			expect(mockCards.update).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct id and payload', async () => {
			mockCards.update.mockReturnValue(of(updatedCard))

			await firstValueFrom(service.update(cardId, updatePayload))

			expect(mockCards.update).toHaveBeenCalledWith(cardId, updatePayload)
		})

		it('should replace the updated card in the list by id', async () => {
			const otherCard = makeCard({ id: 'c-2', name: 'Other Card' })
			// pre-set existing cards in the signal
			service.cards.set([makeCard({ id: 'c-1', name: 'Old Name' }), otherCard])

			mockCards.update.mockReturnValue(of(updatedCard))

			await firstValueFrom(service.update(cardId, updatePayload))

			// tap.next replaces matching card by id — other cards untouched
			expect(service.cards()).toEqual([updatedCard, otherCard])
			expect(service.loading()).toBe(false)
		})

		it('should set error signal and reset loading when API fails', async () => {
			mockCards.update.mockReturnValue(
				throwError(() => new Error('Update failed')),
			)

			await expect(
				firstValueFrom(service.update(cardId, updatePayload)),
			).rejects.toThrow('Update failed')

			expect(service.loading()).toBe(false)
			expect(service.error()).toBe('Update failed')
		})
	})

	describe('findById()', () => {
		it('should return the card with the given Id', async () => {
			const card = makeCard({ id: 'c-1', type: CardType.DEBIT_CARD })
			mockCards.findById.mockReturnValue(of(card))

			const result = await firstValueFrom(service.findById('c-1'))

			expect(result).toEqual(card)
			expect(mockCards.findById).toHaveBeenCalledOnce()
			expect(mockCards.findById).toHaveBeenCalledWith('c-1')
		})
	})

	describe('delete()', () => {
		const cardId = 'c-1'

		it('should return a success message when deletion is successful', async () => {
			mockCards.delete.mockReturnValue(
				of({ message: 'Card deleted successfully', success: true }),
			)

			const result = await firstValueFrom(service.delete(cardId))

			expect(result).toEqual('Card deleted successfully')
			expect(mockCards.delete).toHaveBeenCalledOnce()
		})

		it('should call the API with the correct Id', async () => {
			mockCards.delete.mockReturnValue(
				of({ message: 'Card deleted successfully', success: true }),
			)

			await firstValueFrom(service.delete(cardId))

			expect(mockCards.delete).toHaveBeenCalledWith(cardId)
		})
	})

	describe('monthlyExpenses()', () => {
		const cardId = 'c-1'
		const params = {
			startDate: '2026-01-01T00:00:00.000Z',
			endDate: '2026-02-02T00:00:00.000Z',
		}

		it('should return the month expenses with the given card Id', async () => {
			const monthlyExpense = { _sum: { amount: '500' } }
			mockCards.monthlyExpenses.mockReturnValue(of(monthlyExpense))

			const result = await firstValueFrom(
				service.monthlyExpenses(cardId, params),
			)

			expect(result).toEqual(monthlyExpense)
			expect(mockCards.monthlyExpenses).toHaveBeenCalledOnce()
			expect(mockCards.monthlyExpenses).toHaveBeenCalledWith(cardId, params)
		})
	})

	describe('cashflow()', () => {
		const cardId = 'c-1'

		it('should return the cashflow for the given card Id', async () => {
			const cashflow = [{ month: 1, year: 2026, income: 1000, expense: 500 }]
			mockCards.cashflow.mockReturnValue(of(cashflow))

			const result = await firstValueFrom(service.cashflow(cardId))

			expect(result).toEqual(cashflow)
			expect(mockCards.cashflow).toHaveBeenCalledOnce()
			expect(mockCards.cashflow).toHaveBeenCalledWith(cardId)
		})
	})

	describe('recentTransactions()', () => {
		const cardId = 'c-1'
		const limit = 5

		it('should return recent transactions with the given card Id', async () => {
			const transactions = [
				{
					id: 't-1',
					title: 'Transaction 1',
					type: 'EXPENSE',
					amount: 100,
					date: '2026-01-01T00:00:00.000Z',
					category: {
						id: 'cat-1',
						title: 'Food',
						type: 'EXPENSE',
						icon: 'utensils',
					},
				},
			]
			mockCards.recentTransactions.mockReturnValue(of(transactions))

			const result = await firstValueFrom(
				service.recentTransactions(cardId, limit),
			)

			expect(result).toEqual(transactions)
			expect(mockCards.recentTransactions).toHaveBeenCalledOnce()
			expect(mockCards.recentTransactions).toHaveBeenCalledWith(cardId, limit)
		})
	})

	describe('countByBankAccount()', () => {
		const bankAccountId = 'ba-1'

		it('should return all cards linked to a bankAccountId', async () => {
			mockCards.countByBankAccount.mockReturnValue(of(3))

			const result = await firstValueFrom(
				service.countByBankAccount(bankAccountId),
			)

			expect(result).toEqual(3)
			expect(mockCards.countByBankAccount).toHaveBeenCalledOnce()
			expect(mockCards.countByBankAccount).toHaveBeenCalledWith(bankAccountId)
		})
	})
})
