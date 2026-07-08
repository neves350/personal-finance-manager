import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { GoogleAuthService } from '@core/services/google-auth.service'
import { makeUser } from '@core/testing/factories'
import { mockAuth, mockGoogleAuth } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Login } from './login'

describe('Login', () => {
	let component: Login
	let fixture: ComponentFixture<Login>
	let router: Router

	beforeEach(async () => {
		vi.clearAllMocks() // clear all requests
		/**
		 * vi.spyOn(object, 'method')
		 * checks the requests of this object with certain method
		 */
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '') // spy toast.error

		await TestBed.configureTestingModule({
			imports: [Login],
			providers: [
				provideRouter([]), // real Router with empty routes
				{ provide: AuthService, useValue: mockAuth },
				{ provide: GoogleAuthService, useValue: mockGoogleAuth },
			],
		}).compileComponents()

		router = TestBed.inject(Router) // takes the real Router
		vi.spyOn(router, 'navigateByUrl') // spy navigateByUrl to check requests

		fixture = TestBed.createComponent(Login)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	describe('form validation', () => {
		it('should start with an invalid form', () => {
			expect(component.form.valid).toBe(false) // empty fields = invalid
		})
		it('should be invalid when email is empty', () => {
			// tests the Validators logic
			component.form.patchValue({ email: '', password: 'password123' })
			expect(component.form.get('email')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when email format is wrong', () => {
			component.form.patchValue({
				email: 'not-an-email',
				password: 'password123',
			})
			expect(component.form.get('email')?.hasError('email')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when password is empty', () => {
			component.form.patchValue({
				email: 'user@example.com',
				password: '',
			})
			expect(component.form.get('password')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when password is too short', () => {
			component.form.patchValue({
				email: 'user@example.com',
				password: '12345',
			})
			expect(component.form.get('password')?.hasError('minlength')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be valid with correct email and password', () => {
			component.form.patchValue({
				email: 'user@example.com',
				password: 'password123',
			})
			expect(component.form.valid).toBe(true)
		})
	})

	describe('onSubmit()', () => {
		const validForm = {
			email: 'user@example.com',
			password: 'password123',
		}

		it('should call AuthService.login with form values', () => {
			mockAuth.login.mockReturnValue(of(makeUser())) // return user
			component.form.patchValue(validForm) // fills the form

			component.onSubmit() // executes the function

			expect(mockAuth.login).toHaveBeenCalledWith(validForm) // verify
		})
		it('should navigate to /dashboard on success', () => {
			mockAuth.login.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard')
		})
		it('should show success toast on success', () => {
			mockAuth.login.mockReturnValue(of(makeUser()))
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.success).toHaveBeenCalledWith('Logged in successfully')
		})
		it('should show "Incorrect email or password" on Invalid email error', () => {
			mockAuth.login.mockReturnValue(
				throwError(() => ({ error: { message: 'Invalid email' } })),
			)
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledWith('Incorrect email or password')
		})
		it('should show "Incorrect email or password" on Invalid password error', () => {
			mockAuth.login.mockReturnValue(
				throwError(() => ({ error: { message: 'Invalid password' } })),
			)
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledWith('Incorrect email or password')
		})
		it('should show generic error on unknown failure', () => {
			mockAuth.login.mockReturnValue(
				throwError(() => ({ error: { message: 'Server error' } })),
			)
			component.form.patchValue(validForm)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledWith(
				'Login failed, please try again later.',
			)
		})
	})

	describe('onGoogleSignIn()', () => {
		it('should call GoogleAuthService.signIn', () => {
			mockGoogleAuth.signIn.mockReturnValue(of('google-jwt')) // google return token
			mockAuth.googleLogin.mockReturnValue(of(makeUser())) // Auth accepts the token

			component.onGoogleSignIn()

			expect(mockGoogleAuth.signIn).toHaveBeenCalled() // verify the return of token
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
})

/**
 * NOTES:
 *
 * <a routerLink="/password/recover">Forgot password?</a>
 * <a routerLink="/register">Sign up</a>
 *
 * For the createUrlTree() and serializeUrl() under the hood:
 *
 * routerLink="/register"
 * → RouterLink.ngOnChanges()
 * → this.router.createUrlTree(['/register'])
 * → this.router.serializeUrl(urlTree)
 * → update the href of <a> element
 */
