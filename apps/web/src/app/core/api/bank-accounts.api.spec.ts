import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { environment } from '../../../environments/environment'
import { BankAccountsApi } from './bank-accounts.api'
import { BankType } from './bank-accounts.interface'

const BASE = `${environment.apiUrl}/bank-account`

describe('BankAccountsApi', () => {
	let bankAccountsApi: BankAccountsApi
	let httpController: HttpTestingController

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BankAccountsApi,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		})
		bankAccountsApi = TestBed.inject(BankAccountsApi)
		httpController = TestBed.inject(HttpTestingController)
	})

	afterEach(() => {
		httpController.verify()
	})

	describe('create', () => {
		it('POST /bank-account with credentials', () => {
			const data = {
				name: 'Account 1',
				type: BankType.WALLET,
				balance: 100,
			}
			bankAccountsApi.create(data).subscribe()

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual(data)
			req.flush({ bankAccount: {}, message: 'created' })
		})
	})

	describe('findAll', () => {
		it('GET /bank-account with credentials', () => {
			bankAccountsApi.findAll().subscribe()

			const req = httpController.expectOne(BASE)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ data: [], total: 0, count: 0 })
		})
	})

	describe('findById', () => {
		it('GET /bank-account/:id with credentials and maps response', () => {
			const bankAccount = {
				name: 'Account 1',
				type: BankType.WALLET,
				balance: 100,
			}
			let result: unknown

			bankAccountsApi.findById('b-1').subscribe((res) => {
				result = res
			})

			const req = httpController.expectOne(`${BASE}/b-1`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ card: bankAccount })

			expect(result).toEqual(bankAccount)
		})
	})

	describe('update', () => {
		it('PATCH /bank-account/:id with credentials and maps response', () => {
			const updated = { id: 't-1', name: 'Account 2', balance: 200 }
			let result: unknown

			bankAccountsApi
				.update('t-1', { name: 'Account 2', balance: 200 })
				.subscribe((res) => {
					result = res
				})

			const req = httpController.expectOne(`${BASE}/t-1`)
			expect(req.request.method).toBe('PATCH')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual({ name: 'Account 2', balance: 200 })
			req.flush({ updatedBankAccount: updated })

			expect(result).toEqual(updated)
		})
	})

	describe('delete', () => {
		it('DELETE /bank-account/:id with credentials', () => {
			bankAccountsApi.delete('t-1').subscribe()

			const req = httpController.expectOne(`${BASE}/t-1`)
			expect(req.request.method).toBe('DELETE')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ message: 'deleted', success: true })
		})
	})

	describe('getBalanceHistory', () => {
		it('GET /bank-account/:id/balance-history with credentials', () => {
			bankAccountsApi.getBalanceHistory('b-1').subscribe()

			const req = httpController.expectOne(`${BASE}/b-1/balance-history`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ data: [] })
		})
	})

	describe('getRecentMovements', () => {
		it('GET /bank-account/:id/recent-movements with credentials', () => {
			bankAccountsApi.getRecentMovements('b-1').subscribe()

			const req = httpController.expectOne(`${BASE}/b-1/recent-movements`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ data: [] })
		})
	})
})
