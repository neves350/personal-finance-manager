import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TransactionType } from '@core/api/transactions.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { TransactionsService } from '@core/services/transactions.service'
import {
	mockBankAccounts,
	mockCategories,
	mockTransactions,
} from '@core/testing/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionsToolbar } from './transactions-toolbar'

describe('TransactionsToolbar', () => {
	let component: TransactionsToolbar
	let fixture: ComponentFixture<TransactionsToolbar>

	beforeEach(async () => {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [TransactionsToolbar],
			providers: [
				{ provide: TransactionsService, useValue: mockTransactions },
				{ provide: CategoriesService, useValue: mockCategories },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
			],
		}).compileComponents()

		fixture = TestBed.createComponent(TransactionsToolbar)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should start with currentPage 1', () => {
		expect(component.currentPage()).toBe(1)
	})

	it('should start with empty searchQuery', () => {
		expect(component.searchQuery()).toBe('')
	})

	describe('onSearch()', () => {
		it('should update searchQuery signal', () => {
			component.onSearch('groceries')

			expect(component.searchQuery()).toBe('groceries')
		})

		it('should emit searchChange output', () => {
			const spy = vi.fn()
			component.searchChange.subscribe(spy)

			component.onSearch('groceries')

			expect(spy).toHaveBeenCalledWith('groceries')
		})
	})

	describe('onFilterChange()', () => {
		it('should reset currentPage to 1', () => {
			component.currentPage.set(3)

			component.onFilterChange({ type: TransactionType.EXPENSE })

			expect(component.currentPage()).toBe(1)
		})

		it('should call service.loadTransactions with params', () => {
			const params = { type: TransactionType.EXPENSE }

			component.onFilterChange(params)

			expect(mockTransactions.loadTransactions).toHaveBeenCalledWith(
				params,
			)
		})
	})

	describe('onFilterReset()', () => {
		it('should reset searchQuery to empty', () => {
			component.onSearch('test')

			component.onFilterReset()

			expect(component.searchQuery()).toBe('')
		})

		it('should emit empty searchChange', () => {
			const spy = vi.fn()
			component.searchChange.subscribe(spy)

			component.onFilterReset()

			expect(spy).toHaveBeenCalledWith('')
		})

		it('should reset currentPage to 1', () => {
			component.currentPage.set(5)

			component.onFilterReset()

			expect(component.currentPage()).toBe(1)
		})

		it('should call service.loadTransactions without params', () => {
			component.onFilterReset()

			expect(mockTransactions.loadTransactions).toHaveBeenCalledWith()
		})
	})
})
