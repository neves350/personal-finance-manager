import {
	HttpClient,
	provideHttpClient,
	withInterceptors,
} from '@angular/common/http'
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { mockAuth, mockRouter } from '@core/testing/mocks'
import { of, throwError } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authInterceptor } from './auth.interceptor'

describe('AuthInterceptor', () => {
	let httpClient: HttpClient
	let httpTestingController: HttpTestingController

	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: mockAuth },
				{ provide: Router, useValue: mockRouter },
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
			],
		})

		httpClient = TestBed.inject(HttpClient)
		httpTestingController = TestBed.inject(HttpTestingController)
	})

	afterEach(() => {
		// Garante que não ficaram requests pendentes por resolver
		httpTestingController.verify()
	})

	it('should clone every request with withCredentials: true', () => {
		httpClient.get('/api/transactions').subscribe()

		const httpRequest = httpTestingController.expectOne('/api/transactions')

		expect(httpRequest.request.withCredentials).toBe(true)

		httpRequest.flush([])
	})

	it('should call refresh and retry the original request on 401', () => {
		mockAuth.refresh.mockReturnValue(of({}))

		httpClient.get('/api/transactions').subscribe()

		// 1ª request → 401
		const firstRequest = httpTestingController.expectOne('/api/transactions')
		firstRequest.flush({}, { status: 401, statusText: 'Unauthorized' })

		// Após o refresh bem-sucedido, o interceptor re-envia a request original
		const retryRequest = httpTestingController.expectOne('/api/transactions')
		retryRequest.flush([])

		expect(mockAuth.refresh).toHaveBeenCalledOnce()
	})

	it('should call clearAuth and navigate to /login when refresh fails', () => {
		mockAuth.refresh.mockReturnValue(
			throwError(() => new Error('refresh failed')),
		)

		httpClient.get('/api/transactions').subscribe({ error: () => {} })

		const httpRequest = httpTestingController.expectOne('/api/transactions')
		httpRequest.flush({}, { status: 401, statusText: 'Unauthorized' })

		expect(mockAuth.clearAuth).toHaveBeenCalledOnce()
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'])
	})
})
