import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { mockAuth, mockRouter } from '@core/testing/mocks'
import { firstValueFrom, type Observable, of } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	makeActivatedRouteSnapshot,
	makeRouterStateSnapshot,
} from '../testing/router'
import { authGuard } from './auth.guard'

describe('AuthGuard', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: mockAuth },
				{ provide: Router, useValue: mockRouter },
			],
		})
	})

	it('should return true when user is authenticated', async () => {
		mockAuth.verifyAuth.mockReturnValue(of(true))

		const activatedRoute = makeActivatedRouteSnapshot()
		const routerState = makeRouterStateSnapshot('/dashboard')

		const guardResult$ = TestBed.runInInjectionContext(() =>
			authGuard(activatedRoute, routerState),
		) as Observable<boolean>

		const canActivate = await firstValueFrom(guardResult$)

		expect(canActivate).toBe(true)
		expect(mockRouter.navigate).not.toHaveBeenCalled()
	})

	it('should redirect to /login with returnUrl when not authenticated', async () => {
		mockAuth.verifyAuth.mockReturnValue(of(false))

		const activatedRoute = makeActivatedRouteSnapshot()
		const routerState = makeRouterStateSnapshot('/dashboard')

		const guardResult$ = TestBed.runInInjectionContext(() =>
			authGuard(activatedRoute, routerState),
		) as Observable<boolean>

		const canActivate = await firstValueFrom(guardResult$)

		expect(canActivate).toBe(false)
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
			queryParams: {
				returnUrl: '/dashboard',
			},
		})
	})
})
