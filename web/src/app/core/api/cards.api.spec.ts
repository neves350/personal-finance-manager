import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { environment } from '../../../environments/environment'
import { CardsApi } from './cards.api'
import type {
	CardActionResponse,
	CardCashflowItem,
	CardMonthlyExpense,
	CardTransaction,
} from './cards.interface'
import { CardColor, CardType } from './cards.interface'

const BASE = `${environment.apiUrl}/cards`

describe('CardsApi', () => {
	let cardsApi: CardsApi
	let httpController: HttpTestingController

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CardsApi,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		})
		cardsApi = TestBed.inject(CardsApi)
		httpController = TestBed.inject(HttpTestingController)
	})

	afterEach(() => {
		httpController.verify()
	})

	describe('create', () => {
		it('POST /cards with credentials', () => {
			const data = {
				name: 'Card 1',
				color: CardColor.BLUE,
				type: CardType.DEBIT_CARD,
			}
			cardsApi.create(data).subscribe()

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual(data)
			req.flush({ card: {}, message: 'created' })
		})
	})

	describe('findById', () => {
		it('GET /cards/:id with credentials and maps response', () => {
			const card = {
				name: 'Card 1',
				color: CardColor.BLUE,
				type: CardType.DEBIT_CARD,
			}
			let result: unknown

			cardsApi.findById('c-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(`${BASE}/c-1`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ card: card })

			expect(result).toEqual(card)
		})
	})

	describe('update', () => {
		it('PATCH /cards/:id with credentials and maps response', () => {
			const updated = { id: 'c-1', name: 'Card 2', type: CardType.DEBIT_CARD }
			let result: unknown

			cardsApi
				.update('c-1', { name: 'Card 2', type: CardType.DEBIT_CARD })
				.subscribe((res) => {
					result = res
				})

			const req = httpController.expectOne(`${BASE}/c-1`)
			expect(req.request.method).toBe('PATCH')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual({
				name: 'Card 2',
				type: CardType.DEBIT_CARD,
			})
			req.flush({ updatedCard: updated })

			expect(result).toEqual(updated)
		})
	})

	describe('findAll', () => {
		it('GET /cards with credentials and maps response', () => {
			const cards = [
				{ name: 'Card 1', color: CardColor.BLUE, type: CardType.DEBIT_CARD },
			]
			let result: unknown

			cardsApi.findAll().subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ cards, total: 1 })

			expect(result).toEqual(cards)
		})

		it('passes bankAccountId as query param when provided', () => {
			cardsApi.findAll('ba-1').subscribe()

			const req = httpController.expectOne(`${BASE}?bankAccountId=ba-1`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ cards: [], total: 0 })
		})
	})

	describe('countByBankAccount', () => {
		it('GET /cards with bankAccountId and maps total', () => {
			let result: unknown

			cardsApi.countByBankAccount('ba-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(`${BASE}?bankAccountId=ba-1`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ cards: [], total: 5 })

			expect(result).toBe(5)
		})
	})

	describe('delete', () => {
		it('DELETE /cards/:id with credentials', () => {
			const response: CardActionResponse = {
				message: 'deleted',
				success: true,
			}
			let result: unknown

			cardsApi.delete('c-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(`${BASE}/c-1`)
			expect(req.request.method).toBe('DELETE')
			expect(req.request.withCredentials).toBe(true)
			req.flush(response)

			expect(result).toEqual(response)
		})
	})

	describe('monthlyExpenses', () => {
		it('GET /cards/:id/expenses with date params', () => {
			const expense: CardMonthlyExpense = {
				_sum: { amount: '150.00' },
			}
			let result: unknown

			cardsApi
				.monthlyExpenses('c-1', {
					startDate: '2026-01-01',
					endDate: '2026-01-31',
				})
				.subscribe((res) => {
					result = res
				})

			const req = httpController.expectOne(
				`${BASE}/c-1/expenses?startDate=2026-01-01&endDate=2026-01-31`,
			)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush(expense)

			expect(result).toEqual(expense)
		})
	})

	describe('cashflow', () => {
		it('GET /cards/:id/cashflow with credentials', () => {
			const data: CardCashflowItem[] = [
				{ month: 1, year: 2026, income: 1000, expense: 500 },
			]
			let result: unknown

			cardsApi.cashflow('c-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(`${BASE}/c-1/cashflow`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ data })

			expect(result).toEqual({ data })
		})
	})

	describe('recentTransactions', () => {
		it('GET /cards/:id/transactions with default limit', () => {
			const transactions: CardTransaction[] = [
				{
					id: 't-1',
					title: 'Coffee',
					type: 'EXPENSE',
					amount: 5,
					date: '2026-01-15',
					category: {
						id: 'cat-1',
						title: 'Food',
						type: 'EXPENSE',
						icon: 'utensils',
					},
				},
			]
			let result: unknown

			cardsApi.recentTransactions('c-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(
				`${BASE}/c-1/transactions?limit=5`,
			)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush(transactions)

			expect(result).toEqual(transactions)
		})

		it('passes custom limit as query param', () => {
			cardsApi.recentTransactions('c-1', 10).subscribe()

			const req = httpController.expectOne(
				`${BASE}/c-1/transactions?limit=10`,
			)
			expect(req.request.method).toBe('GET')
			req.flush([])
		})
	})
})
