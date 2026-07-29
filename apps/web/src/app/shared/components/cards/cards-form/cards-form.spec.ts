import { TestBed } from '@angular/core/testing'
import { CardColor, CardType } from '@core/api/cards.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { mockBankAccounts, mockCards } from '@core/testing/mocks'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { CardsForm } from './cards-form'

const mockSheetRef = { close: vi.fn() }

describe('CardsForm', () => {
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [CardsForm],
			providers: [
				{ provide: Z_SHEET_DATA, useValue: zData },
				{ provide: ZardSheetRef, useValue: mockSheetRef },
				{ provide: CardsService, useValue: mockCards },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(CardsForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: CardsForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should start with empty name', () => {
			expect(component.form.get('name')?.value).toBe('')
		})

		it('should default color to GRAY', () => {
			expect(component.form.get('color')?.value).toBe(CardColor.GRAY)
		})

		it('should default type to CREDIT_CARD', () => {
			expect(component.form.get('type')?.value).toBe(CardType.CREDIT_CARD)
		})

		it('should start with empty lastFour', () => {
			expect(component.form.get('lastFour')?.value).toBe('')
		})

		it('should default creditLimit to 0', () => {
			expect(component.form.get('creditLimit')?.value).toBe(0)
		})

		it('should start with empty bankAccountId', () => {
			expect(component.form.get('bankAccountId')?.value).toBe('')
		})

		it('should start with empty expirationDate', () => {
			expect(component.form.get('expirationDate')?.value).toBe('')
		})

		it('should start with empty cvc', () => {
			expect(component.form.get('cvc')?.value).toBe('')
		})

		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})

		it('should be invalid when required fields are empty', () => {
			expect(component.form.valid).toBe(false)
		})

		it('should be invalid when expirationDate format is wrong', () => {
			component.form.patchValue({ expirationDate: '1234' })
			expect(component.form.get('expirationDate')?.hasError('pattern')).toBe(
				true,
			)
		})

		it('should accept valid expirationDate format MM/YY', () => {
			component.form.patchValue({ expirationDate: '12/26' })
			expect(component.form.get('expirationDate')?.errors).toBeNull()
		})

		it('should be invalid when cvc is too short', () => {
			component.form.patchValue({ cvc: '12' })
			expect(component.form.get('cvc')?.hasError('minlength')).toBe(true)
		})

		it('should reject cvc with 5 digits', () => {
			component.form.patchValue({ cvc: '12345' })
			expect(component.form.get('cvc')?.hasError('maxlength')).toBe(true)
		})

		it('should call service.create on submit', () => {
			mockCards.create.mockReturnValue(of({}))
			component.form.patchValue({
				name: 'My Card',
				bankAccountId: 'account-1',
				expirationDate: '12/26',
				cvc: '123',
			})

			component.submit()

			expect(mockCards.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'My Card',
					color: CardColor.GRAY,
					type: CardType.CREDIT_CARD,
					bankAccountId: 'account-1',
				}),
			)
		})

		it('should close sheet on successful submit', () => {
			mockCards.create.mockReturnValue(of({}))
			component.form.patchValue({
				name: 'My Card',
				bankAccountId: 'account-1',
				expirationDate: '12/26',
				cvc: '123',
			})

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockCards.create).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('name')?.touched).toBe(true)
		})
	})

	describe('edit mode', () => {
		const existingCard = {
			id: 'card-1',
			name: 'Old Card',
			color: CardColor.BLUE,
			type: CardType.DEBIT_CARD,
			lastFour: '5678',
			creditLimit: 1000,
			closingDay: 5,
			dueDay: 15,
			accountId: 'account-1',
			expirationDate: '06/27',
			cvc: '456',
		}

		let component: CardsForm

		beforeEach(async () => {
			;({ component } = await setup(existingCard))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})

		it('should populate form with existing data', () => {
			expect(component.form.get('name')?.value).toBe('Old Card')
			expect(component.form.get('color')?.value).toBe(CardColor.BLUE)
			expect(component.form.get('type')?.value).toBe(CardType.DEBIT_CARD)
			expect(component.form.get('lastFour')?.value).toBe('5678')
			expect(component.form.get('closingDay')?.value).toBe('5')
			expect(component.form.get('dueDay')?.value).toBe('15')
			expect(component.form.get('bankAccountId')?.value).toBe('account-1')
			expect(component.form.get('expirationDate')?.value).toBe('06/27')
			expect(component.form.get('cvc')?.value).toBe('456')
		})

		it('should call service.update on submit', () => {
			mockCards.update.mockReturnValue(of({}))

			component.submit()

			expect(mockCards.update).toHaveBeenCalledWith(
				'card-1',
				expect.objectContaining({
					name: 'Old Card',
					color: CardColor.BLUE,
					type: CardType.DEBIT_CARD,
					bankAccountId: 'account-1',
				}),
			)
		})
	})

	describe('previewData', () => {
		it('should reflect form changes reactively', async () => {
			const { component } = await setup()

			component.form.patchValue({ name: 'Test', color: CardColor.BLUE })

			expect(component.previewData().name).toBe('Test')
			expect(component.previewData().color).toBe(CardColor.BLUE)
		})

		it('should show fallback name when empty', async () => {
			const { component } = await setup()

			expect(component.previewData().name).toBe('Card Name')
		})
	})
})
