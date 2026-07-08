import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { GoogleAuthService } from '@core/services/google-auth.service'
import { makeUser } from '@core/testing/factories'
import { mockAuth, mockGoogleAuth } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Register } from './register'

describe('Register', () => {
	let component: Register
	let fixture: ComponentFixture<Register>
	let router: Router

	beforeEach(async () => {
		vi.clearAllMocks()
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')

		await TestBed.configureTestingModule({
			imports: [Register],
			providers: [
				provideRouter([]),
				{ provide: AuthService, useValue: mockAuth },
				{ provide: GoogleAuthService, useValue: mockGoogleAuth },
			],
		}).compileComponents()

		router = TestBed.inject(Router)
		vi.spyOn(router, 'navigateByUrl')

		fixture = TestBed.createComponent(Register)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	describe('form validation', () => {
		it('should start with an invalid form', () => {
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when name is empty', () => {
			component.form.patchValue({
				name: '',
				email: 'user@example.com',
				password: 'Pass1!xx',
			})
			expect(component.form.get('name')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when email is empty', () => {
			component.form.patchValue({
				name: 'User',
				email: '',
				password: 'Pass1!xx',
			})
			expect(component.form.get('email')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when email format is wrong', () => {
			component.form.patchValue({
				name: 'User',
				email: 'not-an-email',
				password: 'Pass1!xx',
			})
			expect(component.form.get('email')?.hasError('email')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when password is empty', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
				password: '',
			})
			expect(component.form.get('password')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a number', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
				password: 'Abcdef!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a lowercase letter', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
				password: 'ABCDE1!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a uppercase letter', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
				password: 'abcde1!',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid without a special character', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
				password: 'Abcde1',
			})
			expect(component.form.valid).toBe(false)
		})
		it('should be valid with a strong password', () => {
			component.form.patchValue({
				name: 'User',
				email: 'user@example.com',
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

	describe('onGoogleSignIn()', () => {
		it('should call GoogleAuthService.signIn', () => {
			mockGoogleAuth.signIn.mockReturnValue(of('google-jwt'))
			mockAuth.googleLogin.mockReturnValue(of(makeUser()))

			component.onGoogleSignIn()

			expect(mockGoogleAuth.signIn).toHaveBeenCalled()
		})
		it('should pass the credential to AuthService.googleLogin', () => {
			mockGoogleAuth.signIn.mockReturnValue(of('google-jwt'))
			mockAuth.googleLogin.mockReturnValue(of(makeUser()))

			component.onGoogleSignIn()

			expect(mockAuth.googleLogin).toHaveBeenCalledWith('google-jwt')
		})
		it('should navigate to /dashboard on success', () => {
			mockGoogleAuth.signIn.mockReturnValue(of('google-jwt'))
			mockAuth.googleLogin.mockReturnValue(of(makeUser()))

			component.onGoogleSignIn()

			expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard')
		})
		it('should show error toast on failure', () => {
			mockGoogleAuth.signIn.mockReturnValue(
				throwError(() => new Error('Google failed')),
			)

			component.onGoogleSignIn()

			expect(toast.error).toHaveBeenCalledWith(
				'Google sign-in failed, please try again.',
			)
		})
	})

	describe('onSubmit()', () => {
		const validForm = {
			name: 'User',
			email: 'user@example.com',
			password: 'Pass1!xx',
		}

		it('should call AuthService.register with form values', () => {
			mockAuth.register.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(mockAuth.register).toHaveBeenCalledWith(validForm)
		})
		it('should navigate to /dashboard on success', () => {
			mockAuth.register.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard')
		})
		it('should show success toast on success', () => {
			mockAuth.register.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.success).toHaveBeenCalledWith('Account create successfully')
		})
		it('should show generic error on unknown failure', () => {
			mockAuth.register.mockReturnValue(
				throwError(() => ({ error: { message: 'Server error' } })),
			)
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledWith(
				'Registration failed, please try again later.',
			)
		})
	})
})
