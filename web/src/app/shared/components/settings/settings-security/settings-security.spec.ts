import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AuthService } from '@core/services/auth.service'
import { UsersService } from '@core/services/users.service'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsSecurity } from './settings-security'

const mockUser = { id: 'user-1', name: 'John', email: 'john@example.com' }

const mockAuth = {
	currentUser: signal(mockUser),
}

const mockUsers = {
	changePassword: vi.fn(),
}

describe('SettingsSecurity', () => {
	let component: SettingsSecurity

	beforeEach(async () => {
		vi.restoreAllMocks()
		mockAuth.currentUser.set(mockUser)

		await TestBed.configureTestingModule({
			imports: [SettingsSecurity],
			providers: [
				{ provide: AuthService, useValue: mockAuth },
				{ provide: UsersService, useValue: mockUsers },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(SettingsSecurity)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should start with empty form', () => {
		const { currentPassword, newPassword, confirmPassword } =
			component.form.getRawValue()
		expect(currentPassword).toBe('')
		expect(newPassword).toBe('')
		expect(confirmPassword).toBe('')
	})

	it('should start with hasChanges false', () => {
		expect(component.hasChanges()).toBe(false)
	})

	it('should start with submitting false', () => {
		expect(component.submitting()).toBe(false)
	})

	describe('hasChanges', () => {
		it('should be true when currentPassword has value', () => {
			component.form.patchValue({ currentPassword: 'old' })
			expect(component.hasChanges()).toBe(true)
		})

		it('should be true when newPassword has value', () => {
			component.form.patchValue({ newPassword: 'new' })
			expect(component.hasChanges()).toBe(true)
		})

		it('should be true when confirmPassword has value', () => {
			component.form.patchValue({ confirmPassword: 'confirm' })
			expect(component.hasChanges()).toBe(true)
		})
	})

	describe('toggle visibility', () => {
		it('should toggle showCurrentPassword', () => {
			expect(component.showCurrentPassword()).toBe(false)
			component.toggleCurrentPassword()
			expect(component.showCurrentPassword()).toBe(true)
			component.toggleCurrentPassword()
			expect(component.showCurrentPassword()).toBe(false)
		})

		it('should toggle showNewPassword', () => {
			expect(component.showNewPassword()).toBe(false)
			component.toggleNewPassword()
			expect(component.showNewPassword()).toBe(true)
		})

		it('should toggle showConfirmPassword', () => {
			expect(component.showConfirmPassword()).toBe(false)
			component.toggleConfirmPassword()
			expect(component.showConfirmPassword()).toBe(true)
		})
	})

	describe('passwordsMatch()', () => {
		it('should return true when passwords match', () => {
			component.form.patchValue({
				newPassword: 'Test1!aa',
				confirmPassword: 'Test1!aa',
			})
			expect(component.passwordsMatch()).toBe(true)
		})

		it('should return false when passwords differ', () => {
			component.form.patchValue({
				newPassword: 'Test1!aa',
				confirmPassword: 'Different1!',
			})
			expect(component.passwordsMatch()).toBe(false)
		})
	})

	describe('isFormValid()', () => {
		it('should return false when form is empty', () => {
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when passwords do not match', () => {
			component.form.patchValue({
				currentPassword: 'oldPass1!',
				newPassword: 'NewPass1!',
				confirmPassword: 'Different1!',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when newPassword is too short', () => {
			component.form.patchValue({
				currentPassword: 'old',
				newPassword: 'Ab1!',
				confirmPassword: 'Ab1!',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when newPassword has no digit', () => {
			component.form.patchValue({
				currentPassword: 'old',
				newPassword: 'Abcdef!',
				confirmPassword: 'Abcdef!',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when newPassword has no lowercase', () => {
			component.form.patchValue({
				currentPassword: 'old',
				newPassword: 'ABCDE1!',
				confirmPassword: 'ABCDE1!',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when newPassword has no uppercase', () => {
			component.form.patchValue({
				currentPassword: 'old',
				newPassword: 'abcde1!',
				confirmPassword: 'abcde1!',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return false when newPassword has no special char', () => {
			component.form.patchValue({
				currentPassword: 'old',
				newPassword: 'Abcde12',
				confirmPassword: 'Abcde12',
			})
			expect(component.isFormValid()).toBe(false)
		})

		it('should return true when all validations pass', () => {
			component.form.patchValue({
				currentPassword: 'oldPass',
				newPassword: 'NewPass1!',
				confirmPassword: 'NewPass1!',
			})
			expect(component.isFormValid()).toBe(true)
		})
	})

	describe('passwordValue', () => {
		it('should start as empty string', () => {
			expect(component.passwordValue()).toBe('')
		})

		it('should reflect newPassword changes', () => {
			component.form.controls.newPassword.setValue('Test1!')
			expect(component.passwordValue()).toBe('Test1!')
		})
	})

	describe('submit()', () => {
		const validForm = {
			currentPassword: 'OldPass1!',
			newPassword: 'NewPass1!',
			confirmPassword: 'NewPass1!',
		}

		it('should not call changePassword when form invalid', () => {
			component.submit()
			expect(mockUsers.changePassword).not.toHaveBeenCalled()
		})

		it('should mark all fields touched when form invalid', () => {
			component.submit()
			expect(component.form.controls.currentPassword.touched).toBe(true)
			expect(component.form.controls.newPassword.touched).toBe(true)
			expect(component.form.controls.confirmPassword.touched).toBe(true)
		})

		it('should not call changePassword when no user', () => {
			mockAuth.currentUser.set(null)
			component.form.patchValue(validForm)

			component.submit()

			expect(mockUsers.changePassword).not.toHaveBeenCalled()
		})

		it('should call changePassword with correct data', () => {
			mockUsers.changePassword.mockReturnValue(of('Password changed'))
			component.form.patchValue(validForm)

			component.submit()

			expect(mockUsers.changePassword).toHaveBeenCalledWith('user-1', {
				currentPassword: 'OldPass1!',
				newPassword: 'NewPass1!',
				confirmPassword: 'NewPass1!',
			})
		})

		it('should set submitting to true while saving', () => {
			mockUsers.changePassword.mockReturnValue(of('Password changed'))
			component.form.patchValue(validForm)

			component.submit()

			expect(mockUsers.changePassword).toHaveBeenCalled()
		})

		it('should show success toast with server message', () => {
			vi.spyOn(toast, 'success').mockImplementation(() => '')
			mockUsers.changePassword.mockReturnValue(of('Password changed'))
			component.form.patchValue(validForm)

			component.submit()

			expect(toast.success).toHaveBeenCalledWith('Password changed')
		})

		it('should reset form on success', () => {
			mockUsers.changePassword.mockReturnValue(of('Password changed'))
			component.form.patchValue(validForm)

			component.submit()

			expect(component.form.getRawValue()).toEqual({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			})
		})

		it('should set submitting to false on success', () => {
			mockUsers.changePassword.mockReturnValue(of('Password changed'))
			component.form.patchValue(validForm)

			component.submit()

			expect(component.submitting()).toBe(false)
		})

		it('should show error toast with server message', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			mockUsers.changePassword.mockReturnValue(
				throwError(() => ({
					error: { message: 'Wrong password' },
				})),
			)
			component.form.patchValue(validForm)

			component.submit()

			expect(toast.error).toHaveBeenCalledWith('Wrong password')
		})

		it('should show fallback error toast', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			mockUsers.changePassword.mockReturnValue(
				throwError(() => ({ error: {} })),
			)
			component.form.patchValue(validForm)

			component.submit()

			expect(toast.error).toHaveBeenCalledWith(
				'Failed to change password',
			)
		})

		it('should set submitting to false on error', () => {
			mockUsers.changePassword.mockReturnValue(
				throwError(() => ({ error: {} })),
			)
			component.form.patchValue(validForm)

			component.submit()

			expect(component.submitting()).toBe(false)
		})
	})
})
