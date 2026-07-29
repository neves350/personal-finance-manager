import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { map } from 'rxjs'

export const authGuard: CanActivateFn = (_route, state) => {
	const authService = inject(AuthService)
	const router = inject(Router)

	return authService.verifyAuth().pipe(
		map((isAuthenticated) => {
			if (isAuthenticated) {
				return true
			}
			router.navigate(['/login'], {
				queryParams: { returnUrl: state.url },
			})
			return false
		}),
	)
}
