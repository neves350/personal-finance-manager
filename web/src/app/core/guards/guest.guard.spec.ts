import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { mockAuth, mockRouter } from '@core/testing/mocks'
import { firstValueFrom, type Observable } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { guestGuard } from './guest.guard'

describe('GuestGuard', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: mockAuth },
				{ provide: Router, useValue: mockRouter },
			],
		})
	})

	it('should return true when user is not authenticated', async () => {
		mockAuth.isAuthenticated.mockReturnValue(false)

		const guardResult$ = TestBed.runInInjectionContext(() =>
			guestGuard({} as never, {} as never),
		) as Observable<boolean>

		const canActivate = await firstValueFrom(guardResult$)

		expect(canActivate).toBe(true)
		expect(mockRouter.navigate).not.toHaveBeenCalled()
	})

	it('should redirect to /dashboard when user is already authenticated', async () => {
		mockAuth.isAuthenticated.mockReturnValue(true)

		const guardResult$ = TestBed.runInInjectionContext(() =>
			guestGuard({} as never, {} as never),
		) as Observable<boolean>

		const canActivate = await firstValueFrom(guardResult$)

		expect(canActivate).toBe(false)
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard'])
	})
})
