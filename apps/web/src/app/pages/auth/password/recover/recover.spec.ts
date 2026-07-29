import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { makeUser } from '@core/testing/factories'
import { mockAuth } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Recover } from './recover'

describe('Recover', () => {
	let component: Recover
	let fixture: ComponentFixture<Recover>
	let router: Router

	beforeEach(async () => {
		vi.clearAllMocks() // clear all requests
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '') // spy toast.error

		await TestBed.configureTestingModule({
			imports: [Recover],
			providers: [
				provideRouter([]), // real Router with empty routes
				{ provide: AuthService, useValue: mockAuth },
			],
		}).compileComponents()

		router = TestBed.inject(Router) // takes the real Router
		vi.spyOn(router, 'navigate') // spy navigateByUrl to check requests

		fixture = TestBed.createComponent(Recover)
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
		it('should be invalid when email is empty', () => {
			component.form.patchValue({ email: '' })
			expect(component.form.get('email')?.hasError('required')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be invalid when email format is wrong', () => {
			component.form.patchValue({ email: 'not-an-email' })
			expect(component.form.get('email')?.hasError('email')).toBe(true)
			expect(component.form.valid).toBe(false)
		})
		it('should be valid with correct email', () => {
			component.form.patchValue({ email: 'user@example.com' })
			expect(component.form.valid).toBe(true)
		})
	})

	describe('onSubmit()', () => {
		const validEmail = { email: 'user@example.com' }

		it('should call AuthService.requestPasswordRecover with form values', () => {
			mockAuth.requestPasswordRecover.mockReturnValue(of(makeUser()))
			component.form.patchValue(validEmail)

			component.onSubmit()

			expect(mockAuth.requestPasswordRecover).toHaveBeenCalledWith(
				validEmail.email,
			)
		})
		it('should navigate to /password/reset on success', () => {
			mockAuth.requestPasswordRecover.mockReturnValue(of(makeUser()))
			component.form.patchValue(validEmail)

			component.onSubmit()

			expect(router.navigate).toHaveBeenCalledWith(['/password/reset'])
		})
		it('should show success toast on success', () => {
			mockAuth.requestPasswordRecover.mockReturnValue(of(makeUser()))
			component.form.patchValue(validEmail)

			component.onSubmit()

			expect(toast.success).toHaveBeenCalledWith(
				'You gonna receive a email, check your email.',
			)
		})
		it('should show generic error on unknown failure', () => {
			mockAuth.requestPasswordRecover.mockReturnValue(
				throwError(() => ({ error: { message: 'Server error' } })),
			)
			component.form.patchValue(validEmail)

			component.onSubmit()

			expect(toast.error).toHaveBeenCalledExactlyOnceWith(
				'Failed to send recovery email',
			)
		})
	})
})
