import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, provideRouter, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { makeUser } from '@core/testing/factories'
import { mockAuth } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Reset } from './reset'

describe('Reset', () => {
	let component: Reset
	let fixture: ComponentFixture<Reset>
	let router: Router

	beforeEach(async () => {
		vi.clearAllMocks() // clear all requests
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '') // spy toast.error

		await TestBed.configureTestingModule({
			imports: [Reset],
			providers: [
				provideRouter([]), // real Router with empty routes
				{ provide: AuthService, useValue: mockAuth },
			],
		}).compileComponents()

		router = TestBed.inject(Router) // takes the real Router
		vi.spyOn(router, 'navigate') // spy navigateByUrl to check requests

		fixture = TestBed.createComponent(Reset)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should auto-fill code from query params', () => {
		const route = TestBed.inject(ActivatedRoute)
		Object.defineProperty(route.snapshot, 'queryParamMap', {
			value: { get: () => 'ABC12' },
		})

		component.ngOnInit()

		expect(component.form.get('code')?.value).toBe('ABC12')
	})

	describe('form validation', () => {
		it('should start with an invalid form', () => {
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when code is empty', () => {
			component.form.patchValue({
				code: '',
				password: 'Pass1!xx',
			})
			expect(component.form.get('code')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when password is empty', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: '',
			})
			expect(component.form.get('password')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a number', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: 'Abcdef!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a lowercase letter', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: 'ABCDE1!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a uppercase letter', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: 'abcde1!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a special character', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: 'Abcde1',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be valid with a strong password', () => {
			component.form.patchValue({
				code: 'ABC12',
				password: 'Pass1!xx',
			})
			expect(component.form.valid).toBe(true)
		})
	})

	describe('password reactivity', () => {
		it('should update passwordValue signal when password changes', () => {
			component.form.controls.password.setValue('Pass1!xx')
			expect(component.passwordValue()).toBe('Pass1!xx')
		})
		it('should toggle showPassword signal', () => {
			expect(component.showPassword()).toBe(false)

			component.togglePassword()
			expect(component.showPassword()).toBe(true)

			component.togglePassword()
			expect(component.showPassword()).toBe(false)
		})
	})

	describe('onSubmit()', () => {
		const validForm = {
			code: 'ABC12',
			password: 'Pass1!xx',
		}

		it('should call AuthService.resetPassword with form values', () => {
			mockAuth.resetPassword.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(mockAuth.resetPassword).toHaveBeenCalledWith(
				validForm.code,
				validForm.password,
			)
		})
		it('should navigate to /login on success', () => {
			mockAuth.requestPasswordRecover.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(router.navigate).toHaveBeenCalledWith(['/login'])
		})
		it('should show success toast on success', () => {
			mockAuth.resetPassword.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.success).toHaveBeenCalledWith(
				'Password reseted successfully',
			)
		})
		it('should show generic error on unknown failure', () => {
			mockAuth.resetPassword.mockReturnValue(
				throwError(() => ({ error: { message: 'Server error' } })),
			)
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledExactlyOnceWith(
				'Invalid or expired code',
			)
		})
	})
})
