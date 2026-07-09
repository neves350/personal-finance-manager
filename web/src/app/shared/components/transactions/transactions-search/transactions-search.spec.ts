import { TestBed } from '@angular/core/testing'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { mockBankAccounts, mockCategories } from '@core/testing/mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionsSearch } from './transactions-search'

describe('TransactionsSearch', () => {
	let component: TransactionsSearch

	beforeEach(async () => {
		vi.restoreAllMocks()

		await TestBed.configureTestingModule({
			imports: [TransactionsSearch],
			providers: [
				{ provide: CategoriesService, useValue: mockCategories },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(TransactionsSearch)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should call loadCategories on init', () => {
		expect(mockCategories.loadCategories).toHaveBeenCalled()
	})

	it('should call loadBankAccounts on init', () => {
		expect(mockBankAccounts.loadBankAccounts).toHaveBeenCalled()
	})

	it('should start with empty searchValue', () => {
		expect(component.searchValue()).toBe('')
	})

	it('should start with showFilters false', () => {
		expect(component.showFilters()).toBe(false)
	})

	it('should start with hasActivateFilters false', () => {
		expect(component.hasActivateFilters()).toBe(false)
	})

	describe('onSearch()', () => {
		it('should update searchValue from event', () => {
			const event = { target: { value: 'groceries' } } as unknown as Event

			component.onSearch(event)

			expect(component.searchValue()).toBe('groceries')
		})

		it('should emit search output', () => {
			const spy = vi.fn()
			component.search.subscribe(spy)
			const event = { target: { value: 'rent' } } as unknown as Event

			component.onSearch(event)

			expect(spy).toHaveBeenCalledWith('rent')
		})

		it('should make hasActivateFilters true', () => {
			const event = {
				target: { value: 'something' },
			} as unknown as Event

			component.onSearch(event)

			expect(component.hasActivateFilters()).toBe(true)
		})
	})

	describe('toggleFilter()', () => {
		it('should toggle showFilters from false to true', () => {
			component.toggleFilter()

			expect(component.showFilters()).toBe(true)
		})

		it('should toggle showFilters back to false', () => {
			component.toggleFilter()
			component.toggleFilter()

			expect(component.showFilters()).toBe(false)
		})
	})

	describe('applyFilter()', () => {
		it('should set filterType', () => {
			component.applyFilter('type', 'EXPENSE')

			expect(component.filterType()).toBe('EXPENSE')
		})

		it('should set filterCategory', () => {
			component.applyFilter('category', 'cat-1')

			expect(component.filterCategory()).toBe('cat-1')
		})

		it('should set filterAccount', () => {
			component.applyFilter('account', 'acc-1')

			expect(component.filterAccount()).toBe('acc-1')
		})

		it('should handle array value (takes first element)', () => {
			component.applyFilter('type', ['INCOME'])

			expect(component.filterType()).toBe('INCOME')
		})

		it('should handle empty array as empty string', () => {
			component.applyFilter('type', [])

			expect(component.filterType()).toBe('')
		})

		it('should emit filterChange with type param', () => {
			const spy = vi.fn()
			component.filterChange.subscribe(spy)

			component.applyFilter('type', 'EXPENSE')

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'EXPENSE' }),
			)
		})

		it('should emit filterChange with categoryId param', () => {
			const spy = vi.fn()
			component.filterChange.subscribe(spy)

			component.applyFilter('category', 'cat-1')

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({ categoryId: 'cat-1' }),
			)
		})

		it('should emit filterChange with accountId param', () => {
			const spy = vi.fn()
			component.filterChange.subscribe(spy)

			component.applyFilter('account', 'acc-1')

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({ accountId: 'acc-1' }),
			)
		})

		it('should combine multiple active filters in emitted params', () => {
			const spy = vi.fn()
			component.applyFilter('type', 'INCOME')
			component.filterChange.subscribe(spy)

			component.applyFilter('category', 'cat-2')

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'INCOME',
					categoryId: 'cat-2',
				}),
			)
		})

		it('should exclude empty filter values from params', () => {
			const spy = vi.fn()
			component.filterChange.subscribe(spy)

			component.applyFilter('type', 'EXPENSE')

			const emitted = spy.mock.calls[0][0]
			expect(emitted).not.toHaveProperty('categoryId')
			expect(emitted).not.toHaveProperty('accountId')
		})

		it('should make hasActivateFilters true', () => {
			component.applyFilter('type', 'EXPENSE')

			expect(component.hasActivateFilters()).toBe(true)
		})
	})

	describe('reset()', () => {
		it('should clear all filter signals', () => {
			component.applyFilter('type', 'EXPENSE')
			component.applyFilter('category', 'cat-1')
			component.applyFilter('account', 'acc-1')

			component.reset()

			expect(component.filterType()).toBe('')
			expect(component.filterCategory()).toBe('')
			expect(component.filterAccount()).toBe('')
		})

		it('should clear searchValue', () => {
			component.onSearch({
				target: { value: 'test' },
			} as unknown as Event)

			component.reset()

			expect(component.searchValue()).toBe('')
		})

		it('should emit filterReset', () => {
			const spy = vi.fn()
			component.filterReset.subscribe(spy)

			component.reset()

			expect(spy).toHaveBeenCalled()
		})

		it('should set hasActivateFilters back to false', () => {
			component.applyFilter('type', 'EXPENSE')
			expect(component.hasActivateFilters()).toBe(true)

			component.reset()

			expect(component.hasActivateFilters()).toBe(false)
		})
	})
})
