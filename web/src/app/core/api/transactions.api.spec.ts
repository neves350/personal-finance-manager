import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { environment } from '../../../environments/environment'
import { TransactionsApi } from './transactions.api'
import { TransactionType } from './transactions.interface'

const BASE = `${environment.apiUrl}/transactions`

describe('TransactionsApi', () => {
	let transactionsApi: TransactionsApi
	let httpController: HttpTestingController

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TransactionsApi,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		})
		transactionsApi = TestBed.inject(TransactionsApi)
		httpController = TestBed.inject(HttpTestingController)
	})

	afterEach(() => {
		httpController.verify()
	})

	describe('create', () => {
		it('POST /transactions with credentials', () => {
			const data = {
				title: 'Transaction 1',
				type: TransactionType.INCOME,
				amount: 100,
				date: new Date(),
				bankAccountId: 'account-1',
				categoryId: 'category-1',
			}
			transactionsApi.create(data).subscribe()

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual(data)
			req.flush({ transaction: {}, message: 'created' })
		})
	})

	describe('findAll', () => {
		it('GET /transactions with credentials', () => {
			transactionsApi.findAll().subscribe()

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ data: [], meta: {} })
		})

		it('GET /transactions passes query params', () => {
			transactionsApi
				.findAll({ type: TransactionType.EXPENSE, page: 2 })
				.subscribe()

			const req = httpController.expectOne((res) => res.url === BASE)
			expect(req.request.method).toBe('GET')
			expect(req.request.params.get('type')).toBe(TransactionType.EXPENSE)
			expect(req.request.params.get('page')).toBe('2')
			req.flush({ data: [], meta: {} })
		})
	})

	describe('findById', () => {
		it('GET /transactions/:id with credentials', () => {
			transactionsApi.findById('t-1').subscribe()

			const req = httpController.expectOne(`${BASE}/t-1`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ id: 't-1', title: 'Transaction 1' })
		})
	})

	describe('update', () => {
		it('PATCH /transactions/:id with credentials and maps response', () => {
			const updated = { id: 't-1', title: 'Updated', amount: 200 }
			let result: unknown

			transactionsApi
				.update('t-1', { title: 'Updated', amount: 200 })
				.subscribe((res) => {
					result = res
				})

			const req = httpController.expectOne(`${BASE}/t-1`)
			expect(req.request.method).toBe('PATCH')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual({ title: 'Updated', amount: 200 })
			req.flush({ updatedTransaction: updated })

			expect(result).toEqual(updated)
		})
	})

	describe('delete', () => {
		it('DELETE /transactions/:id with credentials', () => {
			transactionsApi.delete('t-1').subscribe()

			const req = httpController.expectOne(`${BASE}/t-1`)
			expect(req.request.method).toBe('DELETE')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ message: 'deleted', success: true })
		})
	})
})
