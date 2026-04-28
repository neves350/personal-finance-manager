import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { of } from 'rxjs'

export const guestGuard: CanActivateFn = () => {
	const authService = inject(AuthService)
	const router = inject(Router)

	// If we already know the user is authenticated, redirect immediately
	if (authService.isAuthenticated()) {
		router.navigate(['/dashboard'])
		return of(false)
	}

	// For guests, allow access without making API calls
	// The authGuard on protected routes will verify authentication when needed
	return of(true)
}
