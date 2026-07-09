import { TestBed } from '@angular/core/testing'
import {
	FrequencyType,
	PaymentMethodType,
	RecurringType,
} from '@core/api/recurrings.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { CategoriesService } from '@core/services/categories.service'
import { RecurringsService } from '@core/services/recurrings.service'
import {
	mockBankAccounts,
	mockCards,
	mockCategories,
	mockRecurrings,
} from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { RecurringsForm } from './recurrings-form'

const mockSheetRef = { close: vi.fn() }

describe('RecurringsForm', () => {
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [RecurringsForm],
			providers: [
				{ provide: Z_SHEET_DATA, useValue: zData },
				{ provide: ZardSheetRef, useValue: mockSheetRef },
				{ provide: RecurringsService, useValue: mockRecurrings },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
				{ provide: CategoriesService, useValue: mockCategories },
				{ provide: CardsService, useValue: mockCards },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(RecurringsForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: RecurringsForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should default type to EXPENSE', () => {
			expect(component.form.get('type')?.value).toBe(RecurringType.EXPENSE)
		})

		it('should start with empty description', () => {
			expect(component.form.get('description')?.value).toBe('')
		})

		it('should default amount to 0', () => {
			expect(component.form.get('amount')?.value).toBe(0)
		})

		it('should start at monthDay 1', () => {
			expect(component.form.get('monthDay')?.value).toBe('1')
		})

		it('should default frequency to MONTH', () => {
			expect(component.form.get('frequency')?.value).toBe(FrequencyType.MONTH)
		})

		it('should start with empty categoryId', () => {
			expect(component.form.get('categoryId')?.value).toBe('')
		})

		it('should default paymentMethod to MONEY', () => {
			expect(component.form.get('paymentMethod')?.value).toBe(
				PaymentMethodType.MONEY,
			)
		})

		it('should start with empty cardId', () => {
			expect(component.form.get('cardId')?.value).toBe('')
		})

		it('should start with empty bankAccountId', () => {
			expect(component.form.get('bankAccountId')?.value).toBe('')
		})

		it('should start with empty endDate', () => {
			expect(component.form.get('endDate')?.value).toBe('')
		})

		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})

		it('should be invalid when description is empty', () => {
			expect(component.form.get('description')?.hasError('required')).toBe(true)
		})

		it('should be invalid when amount is 0', () => {
			expect(component.form.get('amount')?.hasError('min')).toBe(true)
		})

		it('should call service.create on submit', () => {
			mockRecurrings.create.mockReturnValue(of({}))
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
			})

			component.submit()

			expect(mockRecurrings.create).toHaveBeenCalledWith(
				expect.objectContaining({
					description: 'My Recurring',
					amount: 20,
					frequency: FrequencyType.MONTH,
				}),
			)
		})

		it('should exclude empty optional fields from payload', () => {
			mockRecurrings.create.mockReturnValue(of({}))
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
			})

			component.submit()

			const payload = mockRecurrings.create.mock.calls[0][0]
			expect(payload).not.toHaveProperty('cardId')
			expect(payload).not.toHaveProperty('endDate')
		})

		it('should include optional fields when filled', () => {
			mockRecurrings.create.mockReturnValue(of({}))
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
				cardId: 'card-1',
				endDate: '2026-12-31T00:00:00.000Z',
			})

			component.submit()

			expect(mockRecurrings.create).toHaveBeenCalledWith(
				expect.objectContaining({
					cardId: 'card-1',
				}),
			)
		})

		it('should show success toast on submit', () => {
			mockRecurrings.create.mockReturnValue(of({}))
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
			})

			component.submit()

			expect(toast.success).toHaveBeenCalledWith(
				'Recurring transaction created successfully',
			)
		})

		it('should show error toast on failure', () => {
			mockRecurrings.create.mockReturnValue(
				throwError(() => ({ message: 'Failed to save recurring transaction' })),
			)
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith(
				'Failed to save recurring transaction',
			)
		})

		it('should close sheet on successful submit', () => {
			mockRecurrings.create.mockReturnValue(of({}))
			component.form.patchValue({
				description: 'My Recurring',
				amount: 20,
				categoryId: 'category-1',
				bankAccountId: 'account-1',
			})

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockRecurrings.create).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('description')?.touched).toBe(true)
		})

		it('should load cards on init', () => {
			expect(mockCards.loadCards).toHaveBeenCalled()
		})
	})

	describe('edit mode', () => {
		const existingRecurring = {
			id: 'recurring-1',
			type: RecurringType.INCOME,
			description: 'Subscription',
			amount: 30,
			monthDay: 15,
			frequency: FrequencyType.MONTH,
			categoryId: 'category-1',
			bankAccountId: 'account-1',
			startDate: '2026-01-01T00:00:00.000Z',
			endDate: '2026-12-31T00:00:00.000Z',
		}

		let component: RecurringsForm

		beforeEach(async () => {
			;({ component } = await setup(existingRecurring))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})

		it('should populate form with existing data', () => {
			expect(component.form.get('type')?.value).toBe(RecurringType.INCOME)
			expect(component.form.get('description')?.value).toBe('Subscription')
			expect(component.form.get('amount')?.value).toBe(30)
			expect(component.form.get('endDate')?.value).toBe(
				'2026-12-31T00:00:00.000Z',
			)
		})

		it('should call service.update on submit', () => {
			mockRecurrings.update.mockReturnValue(of({}))

			component.submit()

			expect(mockRecurrings.update).toHaveBeenCalledWith(
				'recurring-1',
				expect.objectContaining({ description: 'Subscription', amount: 30 }),
			)
		})

		it('should show success toast with "updated" on edit', () => {
			mockRecurrings.update.mockReturnValue(of({}))

			component.submit()

			expect(toast.success).toHaveBeenCalledWith(
				'Recurring transaction updated successfully',
			)
		})
	})

	describe('selectPayments()', () => {
		it('should change the paymentMethod form control', async () => {
			const { component } = await setup()

			component.selectPayments(PaymentMethodType.CARD)

			expect(component.form.get('paymentMethod')?.value).toBe(
				PaymentMethodType.CARD,
			)
		})
	})

	describe('onStartDateChange()', () => {
		it('should set startDate as ISO string', async () => {
			const { component } = await setup()
			const date = new Date('2026-06-15T00:00:00.000Z')

			component.onStartDateChange(date)

			expect(component.form.get('startDate')?.value).toBe(
				'2026-06-15T00:00:00.000Z',
			)
		})

		it('should set empty string when date is null', async () => {
			const { component } = await setup()

			component.onStartDateChange(null)

			expect(component.form.get('startDate')?.value).toBe('')
		})
	})

	describe('onEndDateChange()', () => {
		it('should set endDate as ISO string', async () => {
			const { component } = await setup()
			const date = new Date('2026-12-31T00:00:00.000Z')

			component.onEndDateChange(date)

			expect(component.form.get('endDate')?.value).toBe(
				'2026-12-31T00:00:00.000Z',
			)
		})

		it('should set empty string when date is null', async () => {
			const { component } = await setup()

			component.onEndDateChange(null)

			expect(component.form.get('endDate')?.value).toBe('')
		})
	})
})
