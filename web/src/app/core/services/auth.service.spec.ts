import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthApi } from '@core/api/auth-api'
import { AuthService } from '@core/services/auth.service'
import { makeAuthResponse, makeUser } from '@core/testing/factories'
import { mockAuth, mockRouter } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('AuthService', () => {
	let service: AuthService

	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthApi, useValue: mockAuth },
				{ provide: Router, useValue: mockRouter },
			],
		})

		service = TestBed.inject(AuthService)
	})

	describe('login()', () => {
		const credentials = { email: 'user@example.com', password: 'password123' }
		const user = makeUser()

		it('should return the user when login succeeds', async () => {
			mockAuth.login.mockReturnValue(of(makeAuthResponse(user)))

			const result = await firstValueFrom(service.login(credentials))

			expect(result).toEqual(user)
		})
		it('should set currentUser signal on success', async () => {
			mockAuth.login.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.login(credentials))

			expect(service.currentUser()).toEqual(user)
		})
		it('should call the API with the correct credentials', async () => {
			mockAuth.login.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.login(credentials))

			expect(mockAuth.login).toHaveBeenCalledWith(credentials)
		})
		it('should throw when response has no user', async () => {
			// makeAuthResponse() with no argument produces { message: 'Success', user: undefined }
			// response.user is falsy → map() throws new Error(...)
			// RxJS catches throws inside operators and converts them to observable errors
			// firstValueFrom() turns that observable error into a rejected Promise
			mockAuth.login.mockReturnValue(of(makeAuthResponse()))

			await expect(firstValueFrom(service.login(credentials))).rejects.toThrow(
				'No user in response',
			)
		})
	})

	describe('googleLogin()', () => {
		// credential is the raw JWT string returned by the Google Identity SDK —
		// a single string, unlike login() which takes an { email, password } object
		const credential = 'google-jwt-token'
		const user = makeUser()

		it('should return the user when googleLogin succeeds', async () => {
			// makeAuthResponse(user) builds { message: 'Success', user }
			// response.user is truthy → map() sets currentUser and returns the user
			mockAuth.googleLogin.mockReturnValue(of(makeAuthResponse(user)))

			const result = await firstValueFrom(service.googleLogin(credential))

			expect(result).toEqual(user)
		})
		it('should set currentUser signal on success', async () => {
			mockAuth.googleLogin.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.googleLogin(credential))

			expect(service.currentUser()).toEqual(user)
		})
		it('should call the API with the correct credential string', async () => {
			mockAuth.googleLogin.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.googleLogin(credential))

			expect(mockAuth.googleLogin).toHaveBeenCalledWith(credential)
		})
		it('should throw when response has no user', async () => {
			// same guard as login() — both methods share the same
			// "if (response.user) ... else throw" pattern in the map() operator
			mockAuth.googleLogin.mockReturnValue(of(makeAuthResponse()))

			await expect(
				firstValueFrom(service.googleLogin(credential)),
			).rejects.toThrow('No user in response')
		})
	})

	describe('register()', () => {
		// register() takes a full payload object — name is required unlike login()
		const payload = {
			name: 'User 1',
			email: 'user@example.com',
			password: 'password123',
		}
		const user = makeUser()

		it('should return the user when register succeeds', async () => {
			mockAuth.register.mockReturnValue(of(makeAuthResponse(user)))

			const result = await firstValueFrom(service.register(payload))

			expect(result).toEqual(user)
		})
		it('should set currentUser signal on success', async () => {
			mockAuth.register.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.register(payload))

			expect(service.currentUser()).toEqual(user)
		})
		it('should call the API with the correct payload', async () => {
			mockAuth.register.mockReturnValue(of(makeAuthResponse(user)))

			await firstValueFrom(service.register(payload))

			expect(mockAuth.register).toHaveBeenCalledWith(payload)
		})
		it('should throw when response has no user', async () => {
			// login(), googleLogin(), and register() all share this same guard —
			// the API can return a success status without a user in the body
			mockAuth.register.mockReturnValue(of(makeAuthResponse()))

			await expect(firstValueFrom(service.register(payload))).rejects.toThrow(
				'No user in response',
			)
		})
	})

	describe('refresh()', () => {
		it('should return the auth response from the API', async () => {
			const authResponse = makeAuthResponse()
			mockAuth.refresh.mockReturnValue(of(authResponse))

			const result = await firstValueFrom(service.refresh())

			expect(result).toEqual(authResponse)
		})
		it('should call the API once with no arguments', async () => {
			mockAuth.refresh.mockReturnValue(of(makeAuthResponse()))

			await firstValueFrom(service.refresh())

			// refresh() is a pure delegation — no mapping, no signal updates
			expect(mockAuth.refresh).toHaveBeenCalledOnce()
			expect(mockAuth.refresh).toHaveBeenCalledWith()
		})
	})

	describe('loadProfile()', () => {
		it('should return the user from the API', async () => {
			const user = makeUser()
			mockAuth.getProfile.mockReturnValue(of(user))

			const result = await firstValueFrom(service.loadProfile())

			expect(result).toEqual(user)
		})
		it('should set currentUser signal with the returned user', async () => {
			const user = makeUser()
			mockAuth.getProfile.mockReturnValue(of(user))

			await firstValueFrom(service.loadProfile())

			// tap() inside loadProfile() sets the signal as a side effect —
			// the observable still emits the user unchanged
			expect(service.currentUser()).toEqual(user)
		})
		it('should call the API once', async () => {
			mockAuth.getProfile.mockReturnValue(of(makeUser()))

			await firstValueFrom(service.loadProfile())

			expect(mockAuth.getProfile).toHaveBeenCalledOnce()
		})
	})

	describe('verifyAuth()', () => {
		it('should return true immediately if currentUser is already set', async () => {
			// verifyAuth() short-circuits with of(true) when currentUser() is truthy —
			// no API calls are made at all
			service.currentUser.set(makeUser())

			const result = await firstValueFrom(service.verifyAuth())

			expect(result).toBe(true)
			expect(mockAuth.getProfile).not.toHaveBeenCalled()
		})
		it('should return true after a successful loadProfile', async () => {
			const user = makeUser()
			mockAuth.getProfile.mockReturnValue(of(user))

			const result = await firstValueFrom(service.verifyAuth())

			// currentUser is set as a side effect of loadProfile()'s tap()
			expect(result).toBe(true)
			expect(service.currentUser()).toEqual(user)
		})
		it('should try refresh + loadProfile when profile fails and return true', async () => {
			const user = makeUser()

			// mockReturnValueOnce chains: first call to getProfile throws (401),
			// second call (inside loadProfile() after refresh) succeeds
			mockAuth.getProfile
				.mockReturnValueOnce(throwError(() => new Error('401')))
				.mockReturnValueOnce(of(user))
			mockAuth.refresh.mockReturnValue(of(makeAuthResponse()))

			const result = await firstValueFrom(service.verifyAuth())

			expect(result).toBe(true)
			expect(service.currentUser()).toEqual(user)
		})
		it('should return false and set currentUser to null when all strategies fail', async () => {
			// both getProfile and refresh fail — the inner catchError handles this:
			// it sets currentUser(null) and returns of(false) to avoid erroring the stream
			mockAuth.getProfile.mockReturnValue(
				throwError(() => new Error('Unauthorized')),
			)
			mockAuth.refresh.mockReturnValue(
				throwError(() => new Error('Refresh failed')),
			)

			const result = await firstValueFrom(service.verifyAuth())

			expect(result).toBe(false)
			expect(service.currentUser()).toBeNull()
		})
	})

	describe('requestPasswordRecover()', () => {
		it('should return the message from the response', async () => {
			mockAuth.requestPasswordRecover.mockReturnValue(
				of({ message: 'Recovery email sent' }),
			)

			const result = await firstValueFrom(
				service.requestPasswordRecover('user@example.com'),
			)

			// map() extracts only response.message — the rest of AuthResponse is discarded
			expect(result).toBe('Recovery email sent')
		})
		it('should call the API with the correct email', async () => {
			mockAuth.requestPasswordRecover.mockReturnValue(
				of({ message: 'Recovery email sent' }),
			)

			await firstValueFrom(service.requestPasswordRecover('user@example.com'))

			expect(mockAuth.requestPasswordRecover).toHaveBeenCalledWith(
				'user@example.com',
			)
		})
	})

	describe('resetPassword()', () => {
		it('should return the message from the response', async () => {
			mockAuth.resetPassword.mockReturnValue(
				of({ message: 'Password reset successfully' }),
			)

			const result = await firstValueFrom(
				service.resetPassword('recovery-code', 'newPassword123'),
			)

			expect(result).toBe('Password reset successfully')
		})
		it('should call the API with the correct code and new password', async () => {
			mockAuth.resetPassword.mockReturnValue(
				of({ message: 'Password reset successfully' }),
			)

			await firstValueFrom(
				service.resetPassword('recovery-code', 'newPassword123'),
			)

			// resetPassword() takes two separate strings — unlike requestPasswordRecover()
			// which takes only an email
			expect(mockAuth.resetPassword).toHaveBeenCalledWith(
				'recovery-code',
				'newPassword123',
			)
		})
	})

	describe('logout()', () => {
		// logout() returns void and subscribes internally — of() and throwError() are
		// synchronous so the callbacks fire immediately, no async/await needed
		it('should clear currentUser and navigate to /login on complete', () => {
			service.currentUser.set(makeUser())
			mockAuth.logout.mockReturnValue(of({ message: 'Logged out' }))

			service.logout()

			expect(service.currentUser()).toBeNull()
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'])
		})
		it('should clear currentUser and navigate to /login even when the API call fails', () => {
			// complete and error callbacks are identical — the user is always signed out
			// locally regardless of whether the server-side logout succeeded
			service.currentUser.set(makeUser())
			mockAuth.logout.mockReturnValue(
				throwError(() => new Error('Network error')),
			)

			service.logout()

			expect(service.currentUser()).toBeNull()
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'])
		})
	})

	describe('clearAuth()', () => {
		it('should set currentUser to null', () => {
			service.currentUser.set(makeUser())

			service.clearAuth()

			expect(service.currentUser()).toBeNull()
		})
	})
})
