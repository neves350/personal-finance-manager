import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { BackendReadinessService } from '@core/services/backend-readiness.service'
import { of } from 'rxjs'

export const guestGuard: CanActivateFn = () => {
	const authService = inject(AuthService)
	const readiness = inject(BackendReadinessService)
	const router = inject(Router)

	// If we already know the user is authenticated, redirect immediately
	if (authService.isAuthenticated()) {
		router.navigate(['/dashboard'])
		return of(false)
	}

	// Guest pages don't need backend readiness - allow rendering immediately
	if (!readiness.ready()) {
		readiness.markReady()
	}

	return of(true)
}
