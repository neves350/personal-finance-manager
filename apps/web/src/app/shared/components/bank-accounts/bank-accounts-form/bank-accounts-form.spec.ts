import { TestBed } from '@angular/core/testing'
import { BankType } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { mockBankAccounts } from '@core/testing/mocks'
import { of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { BankAccountsForm } from './bank-accounts-form'

const mockDialogRef = { close: vi.fn() }

describe('BankAccountsForm', () => {
	/**
	 * This component is opened inside a dialog (Z_MODAL_DATA).
	 * In CREATE mode, zData is empty ({}).
	 * In EDIT mode, zData has id + existing values.
	 * We need a helper to configure TestBed with different zData per scenario.
	 */
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [BankAccountsForm],
			providers: [
				{ provide: Z_MODAL_DATA, useValue: zData },
				{ provide: ZardDialogRef, useValue: mockDialogRef },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(BankAccountsForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: BankAccountsForm

		beforeEach(async () => {
			// ; -> destructuring assignment
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})
		it('should start with empty name', () => {
			expect(component.form.get('name')?.value).toBe('')
		})
		it('should default type to CHECKING', () => {
			expect(component.form.get('type')?.value).toBe(BankType.CHECKING)
		})
		it('should default balance to 0', () => {
			expect(component.form.get('balance')?.value).toBe(0)
		})
		it('should be invalid when name is empty', () => {
			expect(component.form.get('name')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be valid when name is filled', () => {
			component.form.patchValue({ name: 'My Account' })
			expect(component.form.valid).toBe(true)
		})
		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})
		it('should call service.create on submit', () => {
			mockBankAccounts.create.mockReturnValue(of({}))
			component.form.patchValue({ name: 'My Account' })

			component.submit()

			expect(mockBankAccounts.create).toHaveBeenCalledWith({
				name: 'My Account',
				type: BankType.CHECKING,
				balance: 0,
			})
		})
		it('should close dialog on successful submit', () => {
			mockBankAccounts.create.mockReturnValue(of({}))
			component.form.patchValue({ name: 'My Account' })

			component.submit()

			expect(mockDialogRef.close).toHaveBeenCalled()
		})
		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockBankAccounts.create).not.toHaveBeenCalled()
		})
		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('name')?.touched).toBe(true)
		})
	})

	describe('edit mode', () => {
		const existingAccount = {
			id: 'account-1',
			name: 'Old Account',
			type: BankType.SAVINGS,
			balance: 250,
		}

		let component: BankAccountsForm

		beforeEach(async () => {
			;({ component } = await setup(existingAccount))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})
		it('should populate form with existing data', () => {
			expect(component.form.get('name')?.value).toBe('Old Account')
			expect(component.form.get('type')?.value).toBe(BankType.SAVINGS)
			expect(component.form.get('balance')?.value).toBe(250)
		})
		it('should call service.update on submit', () => {
			mockBankAccounts.update.mockReturnValue(of({}))

			component.submit()

			expect(mockBankAccounts.update).toHaveBeenCalledWith('account-1', {
				name: 'Old Account',
				type: BankType.SAVINGS,
				balance: 250,
			})
		})
	})

	describe('previewData', () => {
		it('should reflect form changes reactively', async () => {
			const { component } = await setup()

			component.form.patchValue({ name: 'Test', balance: 500 })

			expect(component.previewData()).toEqual({
				name: 'Test',
				type: BankType.CHECKING,
				balance: 500,
			})
		})
		it('should show fallback name when empty', async () => {
			const { component } = await setup()

			expect(component.previewData().name).toBe('Account Name')
		})
	})
})
