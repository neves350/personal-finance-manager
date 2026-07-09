import { TestBed } from '@angular/core/testing'
import { CategoryType } from '@core/api/categories.interface'
import { CategoriesService } from '@core/services/categories.service'
import { makeCategory } from '@core/testing/factories'
import { mockCategories } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { CategoriesForm } from './categories-form'

const mockSheetRef = { close: vi.fn() }

describe('CategoriesForm', () => {
	async function setup(zData: Record<string, unknown> = {}) {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [CategoriesForm],
			providers: [
				{ provide: Z_SHEET_DATA, useValue: zData },
				{ provide: ZardSheetRef, useValue: mockSheetRef },
				{ provide: CategoriesService, useValue: mockCategories },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(CategoriesForm)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	describe('create mode', () => {
		let component: CategoriesForm

		beforeEach(async () => {
			;({ component } = await setup())
		})

		it('should create', () => {
			expect(component).toBeTruthy()
		})

		it('should start with empty title', () => {
			expect(component.form.get('title')?.value).toBe('')
		})

		it('should start with empty icon', () => {
			expect(component.form.get('icon')?.value).toBe('')
		})

		it('should start with empty color', () => {
			expect(component.form.get('color')?.value).toBe('')
		})

		it('should default type to EXPENSE', () => {
			expect(component.form.get('type')?.value).toBe(CategoryType.EXPENSE)
		})

		it('should not be in edit mode', () => {
			expect(component.isEditMode()).toBe(false)
		})

		it('should be invalid when required fields are empty', () => {
			expect(component.form.valid).toBe(false)
		})

		it('should call service.create on submit', () => {
			mockCategories.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Food',
				icon: 'utensils',
				color: 'red',
				type: CategoryType.EXPENSE,
			})

			component.submit()

			expect(mockCategories.create).toHaveBeenCalledWith({
				title: 'Food',
				icon: 'utensils',
				color: 'red',
				type: CategoryType.EXPENSE,
			})
		})

		it('should show success toast on submit', () => {
			mockCategories.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Food',
				icon: 'utensils',
				color: 'red',
			})

			component.submit()

			expect(toast.success).toHaveBeenCalledWith(
				'Category created successfully',
			)
		})

		it('should show error toast on failure', () => {
			mockCategories.create.mockReturnValue(throwError(() => new Error('fail')))
			component.form.patchValue({
				title: 'Food',
				icon: 'utensils',
				color: 'red',
			})

			component.submit()

			expect(toast.error).toHaveBeenCalledWith('Failed to create category')
		})

		it('should close sheet on successful submit', () => {
			mockCategories.create.mockReturnValue(of({}))
			component.form.patchValue({
				title: 'Food',
				icon: 'utensils',
				color: 'red',
			})

			component.submit()

			expect(mockSheetRef.close).toHaveBeenCalled()
		})

		it('should not call service when form is invalid', () => {
			component.submit()

			expect(mockCategories.create).not.toHaveBeenCalled()
		})

		it('should mark fields as touched when submitting invalid form', () => {
			component.submit()

			expect(component.form.get('title')?.touched).toBe(true)
		})
	})

	describe('edit mode', () => {
		const existingCategory = {
			id: 'category-1',
			title: 'Old Category',
			icon: 'phone',
			color: 'blue',
			type: CategoryType.INCOME,
		}

		let component: CategoriesForm
		let fixture: ReturnType<typeof TestBed.createComponent<CategoriesForm>>

		beforeEach(async () => {
			;({ component, fixture } = await setup(existingCategory))
		})

		it('should be in edit mode', () => {
			expect(component.isEditMode()).toBe(true)
		})

		it('should populate form with existing data', () => {
			expect(component.form.get('title')?.value).toBe('Old Category')
			expect(component.form.get('icon')?.value).toBe('phone')
			expect(component.form.get('color')?.value).toBe('blue')
			expect(component.form.get('type')?.value).toBe(CategoryType.INCOME)
		})

		it('should call service.update when category input is set', () => {
			mockCategories.update.mockReturnValue(of({}))
			const category = makeCategory({ id: 'category-1' })
			fixture.componentRef.setInput('category', category)

			component.submit()

			expect(mockCategories.update).toHaveBeenCalledWith(
				'category-1',
				expect.objectContaining({ title: 'Old Category' }),
			)
		})

		it('should show success toast with "updated" on edit', () => {
			mockCategories.update.mockReturnValue(of({}))
			const category = makeCategory({ id: 'category-1' })
			fixture.componentRef.setInput('category', category)

			component.submit()

			expect(toast.success).toHaveBeenCalledWith(
				'Category updated successfully',
			)
		})
	})

	describe('selectType()', () => {
		it('should change the type form control', async () => {
			const { component } = await setup()

			component.selectType(CategoryType.INCOME)

			expect(component.form.get('type')?.value).toBe(CategoryType.INCOME)
		})
	})

	describe('previewData', () => {
		it('should reflect form changes reactively', async () => {
			const { component } = await setup()

			component.form.patchValue({ title: 'Test', icon: 'star' })

			expect(component.previewData().title).toBe('Test')
			expect(component.previewData().icon).toBe('star')
		})

		it('should show fallback title when empty', async () => {
			const { component } = await setup()

			expect(component.previewData().title).toBe('Category Title')
		})
	})
})
