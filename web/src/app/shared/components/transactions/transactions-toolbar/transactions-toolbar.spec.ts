import { TestBed } from '@angular/core/testing'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { TransactionsService } from '@core/services/transactions.service'
import {
	mockBankAccounts,
	mockCategories,
	mockTransactions,
} from '@core/testing/mocks'
import { TransactionType } from '@core/api/transactions.interface'
import { describe, expect, it, vi } from 'vitest'
import { TransactionsToolbar } from './transactions-toolbar'

describe('TransactionsToolbar', () => {
	async function setup() {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [TransactionsToolbar],
			providers: [
				{ provide: TransactionsService, useValue: mockTransactions },
				{ provide: CategoriesService, useValue: mockCategories },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(TransactionsToolbar)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	it('should create', async () => {
		const { component } = await setup()
		expect(component).toBeTruthy()
	})

	it('should start with currentPage 1', async () => {
		const { component } = await setup()
		expect(component.currentPage()).toBe(1)
	})

	it('should start with empty searchQuery', async () => {
		const { component } = await setup()
		expect(component.searchQuery()).toBe('')
	})

	describe('onSearch()', () => {
		it('should update searchQuery signal', async () => {
			const { component } = await setup()

			component.onSearch('groceries')

			expect(component.searchQuery()).toBe('groceries')
		})

		it('should emit searchChange output', async () => {
			const { component } = await setup()
			const spy = vi.fn()
			component.searchChange.subscribe(spy)

			component.onSearch('groceries')

			expect(spy).toHaveBeenCalledWith('groceries')
		})
	})

	describe('onFilterChange()', () => {
		it('should reset currentPage to 1', async () => {
			const { component } = await setup()
			component.currentPage.set(3)

			component.onFilterChange({ type: TransactionType.EXPENSE })

			expect(component.currentPage()).toBe(1)
		})

		it('should call service.loadTransactions with params', async () => {
			const { component } = await setup()
			const params = { type: TransactionType.EXPENSE }

			component.onFilterChange(params)

			expect(mockTransactions.loadTransactions).toHaveBeenCalledWith(params)
		})
	})

	describe('onFilterReset()', () => {
		it('should reset searchQuery to empty', async () => {
			const { component } = await setup()
			component.onSearch('test')

			component.onFilterReset()

			expect(component.searchQuery()).toBe('')
		})

		it('should emit empty searchChange', async () => {
			const { component } = await setup()
			const spy = vi.fn()
			component.searchChange.subscribe(spy)

			component.onFilterReset()

			expect(spy).toHaveBeenCalledWith('')
		})

		it('should reset currentPage to 1', async () => {
			const { component } = await setup()
			component.currentPage.set(5)

			component.onFilterReset()

			expect(component.currentPage()).toBe(1)
		})

		it('should call service.loadTransactions without params', async () => {
			const { component } = await setup()

			component.onFilterReset()

			expect(mockTransactions.loadTransactions).toHaveBeenCalledWith()
		})
	})
})
