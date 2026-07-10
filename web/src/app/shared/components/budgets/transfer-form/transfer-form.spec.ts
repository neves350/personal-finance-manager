import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { BudgetsService } from '@core/services/budgets.service'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { TransferForm } from './transfer-form'

const mockDialogRef = { close: vi.fn() }

const mockBudgets = {
	envelopes: signal([]),
	transferEnvelopes: vi.fn(),
}

describe('TransferForm', () => {
	async function setup(
		zData: Record<string, unknown> = { budgetId: 'budget-1' },
	) {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [TransferForm],
			providers: [
				{ provide: Z_MODAL_DATA, useValue: zData },
				{ provide: ZardDialogRef, useValue: mockDialogRef },
				{ provide: BudgetsService, useValue: mockBudgets },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(TransferForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('form defaults', () => {
		let component: TransferForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should start with empty fromEnvelopeId', () => {
			expect(component.form.get('fromEnvelopeId')?.value).toBe('')
		})

		it('should start with empty toEnvelopeId', () => {
			expect(component.form.get('toEnvelopeId')?.value).toBe('')
		})

		it('should start with null amount', () => {
			expect(component.form.get('amount')?.value).toBeNull()
		})

		it('should be invalid when required fields are empty', () => {
			expect(component.form.valid).toBe(false)
		})

		it('should be invalid when amount is 0', () => {
			component.form.patchValue({ amount: 0 })
			expect(component.form.get('amount')?.hasError('min')).toBe(true)
		})
	})

	describe('submit', () => {
		let component: TransferForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should call service.transferEnvelopes on valid submit', () => {
			mockBudgets.transferEnvelopes.mockReturnValue(of({}))
			component.form.patchValue({
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-2',
				amount: 50,
			})

			component.submit()

			expect(mockBudgets.transferEnvelopes).toHaveBeenCalledWith('budget-1', {
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-2',
				amount: 50,
			})
		})

		it('should show success toast on submit', () => {
			mockBudgets.transferEnvelopes.mockReturnValue(of({}))
			component.form.patchValue({
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-2',
				amount: 50,
			})

			component.submit()

			expect(toast.success).toHaveBeenCalledWith(
				'Transfer completed successfully',
			)
		})

		it('should close dialog on successful submit', () => {
			mockBudgets.transferEnvelopes.mockReturnValue(of({}))
			component.form.patchValue({
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-2',
				amount: 50,
			})

			component.submit()

			expect(mockDialogRef.close).toHaveBeenCalled()
		})

		it('should show error toast on failure', () => {
			mockBudgets.transferEnvelopes.mockReturnValue(
				throwError(() => ({ message: 'fail' })),
			)
			component.form.patchValue({
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-2',
				amount: 50,
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith(
				'Failed to transfer between envelopes',
			)
		})

		it('should show error when source and destination are the same', () => {
			component.form.patchValue({
				fromEnvelopeId: 'env-1',
				toEnvelopeId: 'env-1',
				amount: 50,
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith(
				'Source and destination must be different',
			)
			expect(mockBudgets.transferEnvelopes).not.toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockBudgets.transferEnvelopes).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('fromEnvelopeId')?.touched).toBe(true)
		})
	})
})
