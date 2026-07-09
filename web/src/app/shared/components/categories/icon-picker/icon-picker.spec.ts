import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { CATEGORY_ICON_NAMES } from '../category-icons'
import { IconPicker } from './icon-picker'

describe('IconPicker', () => {
	async function setup() {
		await TestBed.configureTestingModule({
			imports: [IconPicker],
		}).compileComponents()

		const fixture = TestBed.createComponent(IconPicker)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	it('should create', async () => {
		const { component } = await setup()
		expect(component).toBeTruthy()
	})

	describe('visibleIcons', () => {
		it('should show only 11 icons by default', async () => {
			const { component } = await setup()
			expect(component['visibleIcons']()).toHaveLength(11)
		})

		it('should show all icons when expanded', async () => {
			const { component } = await setup()
			component.toggleExpanded()
			expect(component['visibleIcons']()).toHaveLength(
				CATEGORY_ICON_NAMES.length,
			)
		})
	})

	describe('toggleExpanded()', () => {
		it('should toggle expanded from false to true', async () => {
			const { component } = await setup()
			expect(component['expanded']()).toBe(false)

			component.toggleExpanded()

			expect(component['expanded']()).toBe(true)
		})

		it('should toggle back to false', async () => {
			const { component } = await setup()
			component.toggleExpanded()
			component.toggleExpanded()

			expect(component['expanded']()).toBe(false)
		})
	})

	describe('selectIcon()', () => {
		it('should update selectedIcon signal', async () => {
			const { component } = await setup()
			component.selectIcon('phone')
			expect(component['selectedIcon']()).toBe('phone')
		})

		it('should call onChange callback', async () => {
			const { component } = await setup()
			const onChangeSpy = vi.fn()
			component.registerOnChange(onChangeSpy)

			component.selectIcon('phone')

			expect(onChangeSpy).toHaveBeenCalledWith('phone')
		})

		it('should call onTouched callback', async () => {
			const { component } = await setup()
			const onTouchedSpy = vi.fn()
			component.registerOnTouched(onTouchedSpy)

			component.selectIcon('phone')

			expect(onTouchedSpy).toHaveBeenCalled()
		})
	})

	describe('writeValue()', () => {
		it('should set selectedIcon from external value', async () => {
			const { component } = await setup()
			component.writeValue('coffee')
			expect(component['selectedIcon']()).toBe('coffee')
		})

		it('should handle null gracefully', async () => {
			const { component } = await setup()
			component.writeValue(null as unknown as string)
			expect(component['selectedIcon']()).toBe('')
		})
	})

	describe('getIconClasses()', () => {
		it('should return selected classes for the active icon', async () => {
			const { component } = await setup()
			component.selectIcon('phone')

			const classes = component.getIconClasses('phone')

			expect(classes).toContain('border-primary')
			expect(classes).toContain('bg-primary/10')
		})

		it('should return default classes for non-selected icon', async () => {
			const { component } = await setup()

			const classes = component.getIconClasses('phone')

			expect(classes).toContain('border-transparent')
			expect(classes).toContain('hover:bg-accent')
		})
	})
})
