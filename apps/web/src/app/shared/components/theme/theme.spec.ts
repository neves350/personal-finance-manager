import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ZardDarkMode } from '@/shared/services/dark-mode'
import { Theme } from './theme'

const mockDarkMode = {
	toggleTheme: vi.fn(),
}

describe('Theme', () => {
	let component: Theme
	let fixture: ComponentFixture<Theme>

	beforeEach(async () => {
		vi.restoreAllMocks()
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})

		await TestBed.configureTestingModule({
			imports: [Theme],
			providers: [{ provide: ZardDarkMode, useValue: mockDarkMode }],
		}).compileComponents()

		fixture = TestBed.createComponent(Theme)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should default darkMode to false when no theme in localStorage', () => {
		expect(component.darkMode).toBe(false)
	})

	it('should initialize darkMode to true when localStorage has dark', async () => {
		vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark')

		TestBed.resetTestingModule()
		await TestBed.configureTestingModule({
			imports: [Theme],
			providers: [{ provide: ZardDarkMode, useValue: mockDarkMode }],
		}).compileComponents()

		const darkFixture = TestBed.createComponent(Theme)
		const darkComponent = darkFixture.componentInstance

		expect(darkComponent.darkMode).toBe(true)
	})

	describe('toggleTheme()', () => {
		it('should toggle darkMode from false to true', () => {
			component.toggleTheme()

			expect(component.darkMode).toBe(true)
		})

		it('should toggle darkMode from true to false', () => {
			component.toggleTheme()

			component.toggleTheme()

			expect(component.darkMode).toBe(false)
		})

		it('should save dark to localStorage when toggling on', () => {
			component.toggleTheme()

			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
		})

		it('should save light to localStorage when toggling off', () => {
			component.toggleTheme()

			component.toggleTheme()

			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
		})

		it('should call darkModeService.toggleTheme', () => {
			component.toggleTheme()

			expect(mockDarkMode.toggleTheme).toHaveBeenCalled()
		})
	})
})
