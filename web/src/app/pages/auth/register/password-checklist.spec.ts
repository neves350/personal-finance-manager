import { ComponentFixture, TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { PasswordChecklist } from './password-checklist'

describe('PasswordChecklist', () => {
	let component: PasswordChecklist
	let fixture: ComponentFixture<PasswordChecklist>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PasswordChecklist],
		}).compileComponents()

		fixture = TestBed.createComponent(PasswordChecklist)
		component = fixture.componentInstance

		// input.required() needs to be defined before the first change detection
		fixture.componentRef.setInput('password', '')
		await fixture.whenStable()
	})

	describe('individual rules', () => {
		it('should detect minimum length', () => {
			fixture.componentRef.setInput('password', '12345')
			expect(component.hasMinLength()).toBe(false)

			fixture.componentRef.setInput('password', '123456')
			expect(component.hasMinLength()).toBe(true)
		})
		it('should detect number', () => {
			fixture.componentRef.setInput('password', 'abcdef')
			expect(component.hasNumber()).toBe(false)

			fixture.componentRef.setInput('password', 'abcde1')
			expect(component.hasNumber()).toBe(true)
		})
		it('should detect lowercase letter', () => {
			fixture.componentRef.setInput('password', 'ABCDEF')
			expect(component.hasLowercase()).toBe(false)

			fixture.componentRef.setInput('password', 'ABCDEf')
			expect(component.hasLowercase()).toBe(true)
		})
		it('should detect uppercase letter', () => {
			fixture.componentRef.setInput('password', 'abcdef')
			expect(component.hasUppercase()).toBe(false)

			fixture.componentRef.setInput('password', 'abcdEf')
			expect(component.hasUppercase()).toBe(true)
		})
		it('should detect symbol', () => {
			fixture.componentRef.setInput('password', 'Abcde1')
			expect(component.hasSymbol()).toBe(false)

			fixture.componentRef.setInput('password', 'Abcde!')
			expect(component.hasSymbol()).toBe(true)
		})
	})

	describe('rules()', () => {
		it('should have all rules unmet for empty password', () => {
			fixture.componentRef.setInput('password', '')
			expect(component.rules().every((r) => !r.met)).toBe(true)
		})
		it('should have all rules met for strong password', () => {
			fixture.componentRef.setInput('password', 'Pass1!')
			expect(component.rules().every((r) => r.met)).toBe(true)
		})
	})

	describe('strength()', () => {
		it('should be 0 for empty password', () => {
			fixture.componentRef.setInput('password', '')
			expect(component.strength()).toBe(0)
		})
		it('should be 20 per rule met', () => {
			fixture.componentRef.setInput('password', 'aaaaaa') // minLength + lowercase
			expect(component.strength()).toBe(40)
		})
		it('should be 100 for strong password', () => {
			fixture.componentRef.setInput('password', 'Pass1!')
			expect(component.strength()).toBe(100)
		})
	})
})
