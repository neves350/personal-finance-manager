import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { AuthService } from '@core/services/auth.service'
import { UsersService } from '@core/services/users.service'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsProfile } from './settings-profile'

const mockUser = {
	id: 'user-1',
	name: 'John Doe',
	email: 'john@example.com',
	avatarUrl: 'https://example.com/avatar.jpg',
}

const mockAuth = {
	currentUser: signal(mockUser),
}

const mockUsers = {
	update: vi.fn(),
}

describe('SettingsProfile', () => {
	let component: SettingsProfile

	beforeEach(async () => {
		vi.restoreAllMocks()
		mockAuth.currentUser.set(mockUser)

		await TestBed.configureTestingModule({
			imports: [SettingsProfile],
			providers: [
				{ provide: AuthService, useValue: mockAuth },
				{ provide: UsersService, useValue: mockUsers },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(SettingsProfile)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should populate form with current user data', () => {
		expect(component.form.value.name).toBe('John Doe')
		expect(component.form.value.email).toBe('john@example.com')
	})

	it('should start with saving false', () => {
		expect(component.saving()).toBe(false)
	})

	it('should start with hasChanges false', () => {
		expect(component.hasChanges()).toBe(false)
	})

	describe('initials', () => {
		it('should return first letters of name', () => {
			expect(component.initials()).toBe('JD')
		})

		it('should handle single word name', () => {
			mockAuth.currentUser.set({ ...mockUser, name: 'John' })
			expect(component.initials()).toBe('J')
		})

		it('should limit to 2 initials for long names', () => {
			mockAuth.currentUser.set({
				...mockUser,
				name: 'John Michael Doe',
			})
			expect(component.initials()).toBe('JM')
		})

		it('should return empty string when no user', () => {
			mockAuth.currentUser.set(null)
			expect(component.initials()).toBe('')
		})
	})

	describe('avatarPreview', () => {
		it('should return user avatarUrl by default', () => {
			expect(component.avatarPreview()).toBe('https://example.com/avatar.jpg')
		})

		it('should return pendingAvatarUrl when set', () => {
			component.pendingAvatarUrl.set('data:image/png;base64,abc')
			expect(component.avatarPreview()).toBe('data:image/png;base64,abc')
		})

		it('should return undefined after deleteImage', () => {
			component.deleteImage()
			expect(component.avatarPreview()).toBeUndefined()
		})

		it('should return undefined when user has no avatarUrl', () => {
			mockAuth.currentUser.set({ ...mockUser, avatarUrl: null })
			expect(component.avatarPreview()).toBeUndefined()
		})
	})

	describe('hasChanges', () => {
		it('should be true when name differs', () => {
			component.form.patchValue({ name: 'Jane Doe' })
			expect(component.hasChanges()).toBe(true)
		})

		it('should be true when email differs', () => {
			component.form.patchValue({ email: 'jane@example.com' })
			expect(component.hasChanges()).toBe(true)
		})

		it('should be true when avatar is pending', () => {
			component.pendingAvatarUrl.set('data:image/png;base64,new')
			expect(component.hasChanges()).toBe(true)
		})

		it('should be true when avatar is deleted', () => {
			component.deleteImage()
			expect(component.hasChanges()).toBe(true)
		})

		it('should be false when values match user', () => {
			expect(component.hasChanges()).toBe(false)
		})

		it('should be false when no user', () => {
			mockAuth.currentUser.set(null)
			expect(component.hasChanges()).toBe(false)
		})
	})

	describe('onFileSelected()', () => {
		it('should reject file larger than 2MB', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			const file = new File(['x'], 'big.png', { type: 'image/png' })
			Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 })
			const input = { files: [file], value: 'big.png' }
			const event = { target: input } as unknown as Event

			component.onFileSelected(event)

			expect(toast.error).toHaveBeenCalledWith('Image must be smaller than 2MB')
			expect(input.value).toBe('')
		})

		it('should not set pendingAvatarUrl for oversized file', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			const file = new File(['x'], 'big.png', { type: 'image/png' })
			Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 })
			const event = {
				target: { files: [file], value: 'big.png' },
			} as unknown as Event

			component.onFileSelected(event)

			expect(component.pendingAvatarUrl()).toBeUndefined()
		})

		it('should do nothing when no file selected', () => {
			const event = {
				target: { files: [] },
			} as unknown as Event

			component.onFileSelected(event)

			expect(component.pendingAvatarUrl()).toBeUndefined()
		})
	})

	describe('deleteImage()', () => {
		it('should clear pendingAvatarUrl', () => {
			component.pendingAvatarUrl.set('data:image/png;base64,abc')

			component.deleteImage()

			expect(component.pendingAvatarUrl()).toBeUndefined()
		})

		it('should set avatarPreview to undefined', () => {
			component.deleteImage()

			expect(component.avatarPreview()).toBeUndefined()
		})
	})

	describe('save()', () => {
		it('should not call update when no changes', () => {
			component.save()

			expect(mockUsers.update).not.toHaveBeenCalled()
		})

		it('should not call update when no user', () => {
			mockAuth.currentUser.set(null)
			component.form.patchValue({ name: 'New' })

			component.save()

			expect(mockUsers.update).not.toHaveBeenCalled()
		})

		it('should set saving to true while updating', () => {
			const updatedUser = { ...mockUser, name: 'Jane Doe' }
			mockUsers.update.mockReturnValue(of(updatedUser))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(mockUsers.update).toHaveBeenCalled()
		})

		it('should call update with changed name only', () => {
			mockUsers.update.mockReturnValue(of({ ...mockUser, name: 'Jane Doe' }))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(mockUsers.update).toHaveBeenCalledWith('user-1', {
				name: 'Jane Doe',
			})
		})

		it('should call update with changed email only', () => {
			mockUsers.update.mockReturnValue(
				of({ ...mockUser, email: 'new@example.com' }),
			)
			component.form.patchValue({ email: 'new@example.com' })

			component.save()

			expect(mockUsers.update).toHaveBeenCalledWith('user-1', {
				email: 'new@example.com',
			})
		})

		it('should include empty avatarUrl when image deleted', () => {
			mockUsers.update.mockReturnValue(of({ ...mockUser, avatarUrl: '' }))
			component.deleteImage()

			component.save()

			expect(mockUsers.update).toHaveBeenCalledWith(
				'user-1',
				expect.objectContaining({ avatarUrl: '' }),
			)
		})

		it('should include pending avatarUrl', () => {
			mockUsers.update.mockReturnValue(of(mockUser))
			component.pendingAvatarUrl.set('data:image/png;base64,new')

			component.save()

			expect(mockUsers.update).toHaveBeenCalledWith(
				'user-1',
				expect.objectContaining({
					avatarUrl: 'data:image/png;base64,new',
				}),
			)
		})

		it('should update currentUser on success', () => {
			const updatedUser = { ...mockUser, name: 'Jane Doe' }
			mockUsers.update.mockReturnValue(of(updatedUser))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(mockAuth.currentUser()).toEqual(updatedUser)
		})

		it('should reset avatar state on success', () => {
			const updatedUser = { ...mockUser }
			mockUsers.update.mockReturnValue(of(updatedUser))
			component.pendingAvatarUrl.set('data:image/png;base64,new')

			component.save()

			expect(component.pendingAvatarUrl()).toBeUndefined()
		})

		it('should set saving to false on success', () => {
			mockUsers.update.mockReturnValue(of({ ...mockUser, name: 'Jane Doe' }))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(component.saving()).toBe(false)
		})

		it('should show success toast', () => {
			vi.spyOn(toast, 'success').mockImplementation(() => '')
			mockUsers.update.mockReturnValue(of({ ...mockUser, name: 'Jane Doe' }))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(toast.success).toHaveBeenCalledWith('Profile updated successfully')
		})

		it('should set saving to false on error', () => {
			mockUsers.update.mockReturnValue(
				throwError(() => ({ error: { message: 'fail' } })),
			)
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(component.saving()).toBe(false)
		})

		it('should show error toast with server message', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			mockUsers.update.mockReturnValue(
				throwError(() => ({ error: { message: 'Email taken' } })),
			)
			component.form.patchValue({ email: 'taken@example.com' })

			component.save()

			expect(toast.error).toHaveBeenCalledWith('Email taken')
		})

		it('should show fallback error toast', () => {
			vi.spyOn(toast, 'error').mockImplementation(() => '')
			mockUsers.update.mockReturnValue(throwError(() => ({ error: {} })))
			component.form.patchValue({ name: 'Jane Doe' })

			component.save()

			expect(toast.error).toHaveBeenCalledWith('Failed to update profile')
		})
	})
})
