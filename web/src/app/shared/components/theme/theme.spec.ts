import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { ZardDarkMode } from '@/shared/services/dark-mode'
import { Theme } from './theme'

const mockDarkMode = {
	toggleTheme: vi.fn(),
}

describe('Theme', () => {
	async function setup() {
		vi.clearAllMocks()
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})

		await TestBed.configureTestingModule({
			imports: [Theme],
			providers: [{ provide: ZardDarkMode, useValue: mockDarkMode }],
		}).compileComponents()

		const fixture = TestBed.createComponent(Theme)
		const component = fixture.componentInstance
		await fixture.whenStable()

		return { fixture, component }
	}

	it('should create', async () => {
		const { component } = await setup()
		expect(component).toBeTruthy()
	})

	it('should default darkMode to false when no theme in localStorage', async () => {
		const { component } = await setup()
		expect(component.darkMode).toBe(false)
	})

	it('should initialize darkMode to true when localStorage has dark', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark')

		await TestBed.configureTestingModule({
			imports: [Theme],
			providers: [{ provide: ZardDarkMode, useValue: mockDarkMode }],
		}).compileComponents()

		const fixture = TestBed.createComponent(Theme)
		const component = fixture.componentInstance

		expect(component.darkMode).toBe(true)
	})

	describe('toggleTheme()', () => {
		it('should toggle darkMode from false to true', async () => {
			const { component } = await setup()

			component.toggleTheme()

			expect(component.darkMode).toBe(true)
		})

		it('should toggle darkMode from true to false', async () => {
			const { component } = await setup()
			component.toggleTheme()

			component.toggleTheme()

			expect(component.darkMode).toBe(false)
		})

		it('should save dark to localStorage when toggling on', async () => {
			const { component } = await setup()

			component.toggleTheme()

			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
		})

		it('should save light to localStorage when toggling off', async () => {
			const { component } = await setup()
			component.toggleTheme()

			component.toggleTheme()

			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
		})

		it('should call darkModeService.toggleTheme', async () => {
			const { component } = await setup()

			component.toggleTheme()

			expect(mockDarkMode.toggleTheme).toHaveBeenCalled()
		})
	})
})
