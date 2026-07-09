import { TestBed } from '@angular/core/testing'
import { GoalType } from '@core/api/goals.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import { GoalsService } from '@core/services/goals.service'
import { mockBankAccounts, mockCategories, mockGoals } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { GoalsForm } from './goals-form'

const mockSheetRef = { close: vi.fn() }

describe('GoalsForm', () => {
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [GoalsForm],
			providers: [
				{ provide: Z_SHEET_DATA, useValue: zData },
				{ provide: ZardSheetRef, useValue: mockSheetRef },
				{ provide: GoalsService, useValue: mockGoals },
				{ provide: BankAccountsService, useValue: mockBankAccounts },
				{ provide: CategoriesService, useValue: mockCategories },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(GoalsForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: GoalsForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should start with empty title', () => {
			expect(component.form.get('title')?.value).toBe('')
		})

		it('should default amount to 0', () => {
			expect(component.form.get('amount')?.value).toBe(0)
		})

		it('should default type to SAVINGS', () => {
			expect(component.form.get('type')?.value).toBe(GoalType.SAVINGS)
		})

		it('should initialize startDate with current date', () => {
			const value = component.form.get('startDate')?.value as string
			expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		})

		it('should start with empty endDate', () => {
			expect(component.form.get('endDate')?.value).toBe('')
		})

		it('should start with empty bankAccountId', () => {
			expect(component.form.get('bankAccountId')?.value).toBe('')
		})

		it('should start with empty categoryId', () => {
			expect(component.form.get('categoryId')?.value).toBe('')
		})

		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})

		it('should be invalid when title is empty', () => {
			expect(component.form.get('title')?.hasError('required')).toBe(true)
		})

		it('should be invalid when amount is 0', () => {
			expect(component.form.get('amount')?.hasError('min')).toBe(true)
		})

		it('should call service.create on submit', () => {
			mockGoals.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
			})

			component.submit()

			expect(mockGoals.create).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'My Goal',
					amount: 150,
					type: GoalType.SAVINGS,
				}),
			)
		})

		it('should exclude empty optional fields from payload', () => {
			mockGoals.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
			})

			component.submit()

			const payload = mockGoals.create.mock.calls[0][0]
			expect(payload).not.toHaveProperty('bankAccountId')
			expect(payload).not.toHaveProperty('categoryId')
			expect(payload).not.toHaveProperty('endDate')
		})

		it('should include optional fields when filled', () => {
			mockGoals.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
				bankAccountId: 'account-1',
				categoryId: 'category-1',
				endDate: '2026-12-31T00:00:00.000Z',
			})

			component.submit()

			expect(mockGoals.create).toHaveBeenCalledWith(
				expect.objectContaining({
					bankAccountId: 'account-1',
					categoryId: 'category-1',
					endDate: '2026-12-31T00:00:00.000Z',
				}),
			)
		})

		it('should show success toast on submit', () => {
			mockGoals.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
			})

			component.submit()

			expect(toast.success).toHaveBeenCalledWith('Goal created successfully')
		})

		it('should show error toast on failure', () => {
			mockGoals.create.mockReturnValue(
				throwError(() => ({ message: 'Failed to save goal' })),
			)
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith('Failed to save goal')
		})

		it('should close sheet on successful submit', () => {
			mockGoals.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'My Goal',
				amount: 150,
			})

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockGoals.create).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('title')?.touched).toBe(true)
		})

		it('should load bank accounts and categories on init', () => {
			expect(mockBankAccounts.loadBankAccounts).toHaveBeenCalled()
			expect(mockCategories.loadCategories).toHaveBeenCalled()
		})
	})

	describe('edit mode', () => {
		const existingGoal = {
			id: 'goal-1',
			title: 'Holiday Fund',
			amount: 500,
			type: GoalType.SPENDING_LIMIT,
			startDate: '2026-01-01T00:00:00.000Z',
			endDate: '2026-12-31T00:00:00.000Z',
		}

		let component: GoalsForm

		beforeEach(async () => {
			;({ component } = await setup(existingGoal))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})

		it('should populate form with existing data', () => {
			expect(component.form.get('title')?.value).toBe('Holiday Fund')
			expect(component.form.get('amount')?.value).toBe(500)
			expect(component.form.get('type')?.value).toBe(GoalType.SPENDING_LIMIT)
			expect(component.form.get('startDate')?.value).toBe(
				'2026-01-01T00:00:00.000Z',
			)
			expect(component.form.get('endDate')?.value).toBe(
				'2026-12-31T00:00:00.000Z',
			)
		})

		it('should call service.update on submit', () => {
			mockGoals.update.mockReturnValue(of({}))

			component.submit()

			expect(mockGoals.update).toHaveBeenCalledWith(
				'goal-1',
				expect.objectContaining({ title: 'Holiday Fund', amount: 500 }),
			)
		})

		it('should show success toast with "updated" on edit', () => {
			mockGoals.update.mockReturnValue(of({}))

			component.submit()

			expect(toast.success).toHaveBeenCalledWith('Goal updated successfully')
		})
	})

	describe('selectType()', () => {
		it('should change the type form control', async () => {
			const { component } = await setup()

			component.selectType(GoalType.SPENDING_LIMIT)

			expect(component.form.get('type')?.value).toBe(GoalType.SPENDING_LIMIT)
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

	describe('previewData', () => {
		it('should reflect form changes reactively', async () => {
			const { component } = await setup()

			component.form.patchValue({ title: 'Test Goal', amount: 300 })

			expect(component.previewData().title).toBe('Test Goal')
			expect(component.previewData().amount).toBe(300)
		})

		it('should show fallback title when empty', async () => {
			const { component } = await setup()

			expect(component.previewData().title).toBe('E.g: Holidays, Gifts...')
		})
	})
})
