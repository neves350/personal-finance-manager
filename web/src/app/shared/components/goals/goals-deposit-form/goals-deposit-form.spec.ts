import { TestBed } from '@angular/core/testing'
import { GoalsService } from '@core/services/goals.service'
import { mockGoals } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { GoalsDepositForm } from './goals-deposit-form'

const mockDialogRef = { close: vi.fn() }

describe('GoalsDepositForm', () => {
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [GoalsDepositForm],
			providers: [
				{ provide: Z_MODAL_DATA, useValue: zData },
				{ provide: ZardDialogRef, useValue: mockDialogRef },
				{ provide: GoalsService, useValue: mockGoals },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(GoalsDepositForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: GoalsDepositForm

		beforeEach(async () => {
			;({ component } = await setup({ id: 'goal-1' }))
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should default amount to 0', () => {
			expect(component.form.get('amount')?.value).toBe(0)
		})

		it('should initialize date with current date', () => {
			const value = component.form.get('date')?.value as string
			expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		})

		it('should start with empty note', () => {
			expect(component.form.get('note')?.value).toBe('')
		})

		it('should be invalid when amount is 0', () => {
			expect(component.form.get('amount')?.hasError('min')).toBe(true)
		})

		it('should call service.addDeposit on submit', () => {
			mockGoals.addDeposit.mockReturnValue(of({}))
			component.form.patchValue({
				date: '2026-12-31T00:00:00.000Z',
				amount: 150,
				note: 'My Note',
			})

			component.submit()

			expect(mockGoals.addDeposit).toHaveBeenCalledWith(
				'goal-1',
				expect.objectContaining({
					date: '2026-12-31T00:00:00.000Z',
					amount: 150,
					note: 'My Note',
				}),
			)
		})

		it('should show success toast on submit', () => {
			mockGoals.addDeposit.mockReturnValue(of({}))
			component.form.patchValue({
				date: '2026-12-31T00:00:00.000Z',
				amount: 150,
				note: 'My Note',
			})

			component.submit()

			expect(toast.success).toHaveBeenCalledWith('Deposit created successfully')
		})

		it('should show error toast on failure', () => {
			mockGoals.addDeposit.mockReturnValue(
				throwError(() => ({ message: 'Failed to create deposit' })),
			)
			component.form.patchValue({
				date: '2026-12-31T00:00:00.000Z',
				amount: 150,
				note: 'My Note',
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith('Failed to create deposit')
		})

		it('should close dialog on successful submit', () => {
			mockGoals.addDeposit.mockReturnValue(of({}))
			component.form.patchValue({
				date: '2026-12-31T00:00:00.000Z',
				amount: 150,
				note: 'My Note',
			})

			component.submit()

			expect(mockDialogRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockGoals.addDeposit).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('date')?.touched).toBe(true)
		})
	})

	describe('onDateChange()', () => {
		it('should set date as ISO string', async () => {
			const { component } = await setup()
			const date = new Date('2026-06-15T00:00:00.000Z')

			component.onDateChange(date)

			expect(component.form.get('date')?.value).toBe('2026-06-15T00:00:00.000Z')
		})

		it('should set empty string when date is null', async () => {
			const { component } = await setup()

			component.onDateChange(null)

			expect(component.form.get('date')?.value).toBe('')
		})
	})
})
