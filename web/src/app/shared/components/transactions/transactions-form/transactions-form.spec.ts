import { TestBed } from '@angular/core/testing'
import { TransactionType } from '@core/api/transactions.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { CategoriesService } from '@core/services/categories.service'
import { TransactionsService } from '@core/services/transactions.service'
import {
	mockBankAccounts,
	mockCards,
	mockCategories,
	mockTransactions,
} from '@core/testing/mocks'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { TransactionsForm } from './transactions-form'
import type { iTransactionData } from './transactions-form.interface'

const mockSheetRef = { close: vi.fn() }

describe('TransactionsForm', () => {
	async function setup(zData: iTransactionData = {}) {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [TransactionsForm],
			providers: [
				{ provide: Z_SHEET_DATA, useValue: zData },
				{ provide: ZardSheetRef, useValue: mockSheetRef },
				{ provide: TransactionsService, useValue: mockTransactions },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
				{ provide: CategoriesService, useValue: mockCategories },
				{ provide: CardsService, useValue: mockCards },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(TransactionsForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: TransactionsForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})

		it('should not be open banking', () => {
			expect(component.isOpenBanking()).toBe(false)
		})

		it('should default type to EXPENSE', () => {
			expect(component.form.get('type')?.value).toBe(TransactionType.EXPENSE)
		})

		it('should start with empty title', () => {
			expect(component.form.get('title')?.value).toBe('')
		})

		it('should default amount to 0', () => {
			expect(component.form.get('amount')?.value).toBe(0)
		})

		it('should have empty date when zData has no date', () => {
			expect(component.form.get('date')?.value).toBe('')
		})

		it('should start with empty bankAccountId', () => {
			expect(component.form.get('bankAccountId')?.value).toBe('')
		})

		it('should start with empty categoryId', () => {
			expect(component.form.get('categoryId')?.value).toBe('')
		})

		it('should start with empty cardId', () => {
			expect(component.form.get('cardId')?.value).toBe('')
		})

		it('should default isPaid to false', () => {
			expect(component.form.get('isPaid')?.value).toBe(false)
		})

		it('should be invalid when title is empty', () => {
			expect(component.form.get('title')?.hasError('required')).toBe(true)
		})

		it('should be invalid when amount is 0', () => {
			expect(component.form.get('amount')?.hasError('min')).toBe(true)
		})

		it('should be invalid when bankAccountId is empty', () => {
			expect(component.form.get('bankAccountId')?.hasError('required')).toBe(
				true,
			)
		})

		it('should be invalid when categoryId is empty', () => {
			expect(component.form.get('categoryId')?.hasError('required')).toBe(true)
		})

		it('should accept valid amount', () => {
			component.form.controls.amount.setValue(50)
			expect(component.form.get('amount')?.valid).toBe(true)
		})

		it('should call service.create on submit', () => {
			mockTransactions.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Groceries',
				amount: 50,
				date: '2026-07-01T00:00:00.000Z',
				bankAccountId: 'account-1',
				categoryId: 'category-1',
			})

			component.submit()

			expect(mockTransactions.create).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Groceries',
					amount: 50,
					type: TransactionType.EXPENSE,
					bankAccountId: 'account-1',
					categoryId: 'category-1',
					isPaid: false,
				}),
			)
		})

		it('should exclude empty optional cardId from payload', () => {
			mockTransactions.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Groceries',
				amount: 50,
				date: '2026-07-01T00:00:00.000Z',
				bankAccountId: 'account-1',
				categoryId: 'category-1',
			})

			component.submit()

			const payload = mockTransactions.create.mock.calls[0][0]
			expect(payload).not.toHaveProperty('cardId')
		})

		it('should include cardId when provided', () => {
			mockTransactions.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Groceries',
				amount: 50,
				date: '2026-07-01T00:00:00.000Z',
				bankAccountId: 'account-1',
				categoryId: 'category-1',
				cardId: 'card-1',
			})

			component.submit()

			expect(mockTransactions.create).toHaveBeenCalledWith(
				expect.objectContaining({ cardId: 'card-1' }),
			)
		})

		it('should close sheet on successful submit', () => {
			mockTransactions.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Groceries',
				amount: 50,
				date: '2026-07-01T00:00:00.000Z',
				bankAccountId: 'account-1',
				categoryId: 'category-1',
			})

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockTransactions.create).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('title')?.touched).toBe(true)
			expect(component.form.get('amount')?.touched).toBe(true)
		})

		it('should load cards on init when not loaded', () => {
			expect(mockCards.loadCards).toHaveBeenCalled()
		})

		it('should load categories on init when not loaded', () => {
			expect(mockCategories.loadCategories).toHaveBeenCalled()
		})

		it('should load bank accounts on init when empty', () => {
			expect(mockBankAccounts.loadBankAccounts).toHaveBeenCalled()
		})
	})

	describe('edit mode', () => {
		const existingTransaction: iTransactionData = {
			id: 'transaction-1',
			title: 'Rent',
			type: TransactionType.EXPENSE,
			amount: 800,
			date: new Date('2026-06-15T00:00:00.000Z'),
			bankAccountId: 'account-1',
			cardId: 'card-1',
			categoryId: 'category-1',
			isPaid: true,
			source: 'MANUAL',
		}

		let component: TransactionsForm

		beforeEach(async () => {
			;({ component } = await setup(existingTransaction))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})

		it('should not be open banking', () => {
			expect(component.isOpenBanking()).toBe(false)
		})

		it('should populate form with existing data', () => {
			expect(component.form.get('title')?.value).toBe('Rent')
			expect(component.form.get('type')?.value).toBe(TransactionType.EXPENSE)
			expect(component.form.get('amount')?.value).toBe(800)
			expect(component.form.get('bankAccountId')?.value).toBe('account-1')
			expect(component.form.get('cardId')?.value).toBe('card-1')
			expect(component.form.get('categoryId')?.value).toBe('category-1')
			expect(component.form.get('isPaid')?.value).toBe(true)
		})

		it('should call service.update on submit', () => {
			mockTransactions.update.mockReturnValue(of({}))

			component.submit()

			expect(mockTransactions.update).toHaveBeenCalledWith(
				'transaction-1',
				expect.objectContaining({ title: 'Rent', amount: 800 }),
			)
		})

		it('should close sheet on successful edit', () => {
			mockTransactions.update.mockReturnValue(of({}))

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})
	})

	describe('open banking mode', () => {
		const openBankingTransaction: iTransactionData = {
			id: 'ob-1',
			title: 'OB Payment',
			type: TransactionType.EXPENSE,
			amount: 200,
			date: new Date('2026-06-10T00:00:00.000Z'),
			bankAccountId: 'account-1',
			categoryId: 'category-1',
			isPaid: true,
			source: 'OPEN_BANKING',
		}

		let component: TransactionsForm

		beforeEach(async () => {
			;({ component } = await setup(openBankingTransaction))
		})

		it('should be in open banking mode', () => {
			expect(component.isOpenBanking()).toBe(true)
		})

		it('should disable amount field', () => {
			expect(component.form.controls.amount.disabled).toBe(true)
		})

		it('should disable date field', () => {
			expect(component.form.controls.date.disabled).toBe(true)
		})

		it('should disable type field', () => {
			expect(component.form.controls.type.disabled).toBe(true)
		})

		it('should disable bankAccountId field', () => {
			expect(component.form.controls.bankAccountId.disabled).toBe(true)
		})

		it('should disable cardId field', () => {
			expect(component.form.controls.cardId.disabled).toBe(true)
		})

		it('should disable isPaid field', () => {
			expect(component.form.controls.isPaid.disabled).toBe(true)
		})

		it('should only send title and categoryId on submit', () => {
			mockTransactions.update.mockReturnValue(of({}))

			component.submit()

			expect(mockTransactions.update).toHaveBeenCalledWith('ob-1', {
				title: 'OB Payment',
				categoryId: 'category-1',
			})
		})
	})

	describe('selectType()', () => {
		it('should change the type form control', async () => {
			const { component } = await setup()

			component.selectType(TransactionType.INCOME)

			expect(component.form.get('type')?.value).toBe(TransactionType.INCOME)
		})
	})

	describe('getTypeClasses()', () => {
		it('should return border-input for unselected type', async () => {
			const { component } = await setup()

			expect(component.getTypeClasses(TransactionType.INCOME)).toBe(
				'border-input',
			)
		})

		it('should return destructive classes for selected EXPENSE', async () => {
			const { component } = await setup()

			expect(component.getTypeClasses(TransactionType.EXPENSE)).toBe(
				'border-destructive bg-destructive/20',
			)
		})

		it('should return primary classes for selected INCOME', async () => {
			const { component } = await setup()
			component.selectType(TransactionType.INCOME)

			expect(component.getTypeClasses(TransactionType.INCOME)).toBe(
				'border-primary bg-primary/20',
			)
		})
	})

	describe('getTypeIconClasses()', () => {
		it('should return text-foreground for unselected type', async () => {
			const { component } = await setup()

			expect(component.getTypeIconClasses(TransactionType.INCOME)).toBe(
				'text-foreground',
			)
		})

		it('should return text-destructive for selected EXPENSE', async () => {
			const { component } = await setup()

			expect(component.getTypeIconClasses(TransactionType.EXPENSE)).toBe(
				'text-destructive',
			)
		})

		it('should return text-primary for selected INCOME', async () => {
			const { component } = await setup()
			component.selectType(TransactionType.INCOME)

			expect(component.getTypeIconClasses(TransactionType.INCOME)).toBe(
				'text-primary',
			)
		})
	})

	describe('onDateChange()', () => {
		it('should set date as ISO string', async () => {
			const { component } = await setup()
			const date = new Date('2026-06-15T00:00:00.000Z')

			component.onDateChange(date)

			expect(component.form.get('date')?.value).toBe(
				'2026-06-15T00:00:00.000Z',
			)
		})

		it('should set empty string when date is null', async () => {
			const { component } = await setup()

			component.onDateChange(null)

			expect(component.form.get('date')?.value).toBe('')
		})
	})

	describe('getTypeLabel()', () => {
		it('should return Expenses for EXPENSE', async () => {
			const { component } = await setup()

			expect(component.getTypeLabel(TransactionType.EXPENSE)).toBe('Expenses')
		})

		it('should return Income for INCOME', async () => {
			const { component } = await setup()

			expect(component.getTypeLabel(TransactionType.INCOME)).toBe('Income')
		})
	})
})
