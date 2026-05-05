import { TestBed } from '@angular/core/testing'
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthApi } from './auth-api'
import { environment } from '../../../environments/environment'

describe('AuthApi', () => {
	let authApi: AuthApi
	let httpController: HttpTestingController

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AuthApi,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		})
		authApi = TestBed.inject(AuthApi)
		httpController = TestBed.inject(HttpTestingController)
	})

	afterEach(() => {
		httpController.verify()
	})

	describe('login', () => {
		it('POST /sessions/password with credentials', () => {
			const credentials = { email: 'user@example.com', password: 'secret' }
			authApi.login(credentials).subscribe()

			const req = httpController.expectOne(
				`${environment.apiUrl}/sessions/password`,
			)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual(credentials)
			req.flush({ accessToken: 'token' })
		})
	})

	describe('googleLogin', () => {
		it('POST /sessions/google with credentials', () => {
			authApi.googleLogin('google-credential-token').subscribe()

			const req = httpController.expectOne(
				`${environment.apiUrl}/sessions/google`,
			)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual({ credential: 'google-credential-token' })
			req.flush({ accessToken: 'token' })
		})
	})

	describe('register', () => {
		it('POST /users with credentials', () => {
			const data = { name: 'John', email: 'john@example.com', password: 'secret' }
			authApi.register(data).subscribe()

			const req = httpController.expectOne(`${environment.apiUrl}/users`)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			expect(req.request.body).toEqual(data)
			req.flush({ accessToken: 'token' })
		})
	})

	describe('refresh', () => {
		it('POST /refresh with credentials', () => {
			authApi.refresh().subscribe()

			const req = httpController.expectOne(`${environment.apiUrl}/refresh`)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ accessToken: 'newToken' })
		})
	})

	describe('getProfile', () => {
		it('GET /profile with credentials', () => {
			authApi.getProfile().subscribe()

			const req = httpController.expectOne(`${environment.apiUrl}/profile`)
			expect(req.request.method).toBe('GET')
			expect(req.request.withCredentials).toBe(true)
			req.flush({ id: '1', email: 'user@example.com' })
		})
	})

	describe('logout', () => {
		it('POST /logout with credentials', () => {
			authApi.logout().subscribe()

			const req = httpController.expectOne(`${environment.apiUrl}/logout`)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(true)
			req.flush({})
		})
	})

	describe('requestPasswordRecover', () => {
		it('POST /password/recover — no withCredentials', () => {
			authApi.requestPasswordRecover('user@example.com').subscribe()

			const req = httpController.expectOne(
				`${environment.apiUrl}/password/recover`,
			)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(false)
			expect(req.request.body).toEqual({ email: 'user@example.com' })
			req.flush({})
		})
	})

	describe('resetPassword', () => {
		it('POST /password/reset — no withCredentials', () => {
			authApi.resetPassword('abc123', 'newpassword').subscribe()

			const req = httpController.expectOne(`${environment.apiUrl}/password/reset`)
			expect(req.request.method).toBe('POST')
			expect(req.request.withCredentials).toBe(false)
			expect(req.request.body).toEqual({ code: 'abc123', newPassword: 'newpassword' })
			req.flush({})
		})
	})
})
