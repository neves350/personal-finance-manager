import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import { catchError, switchMap, throwError } from 'rxjs'

let isRefreshing = false

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService)
	const router = inject(Router)

	const clonedRequest = req.clone({ withCredentials: true })

	return next(clonedRequest).pipe(
		catchError((error: HttpErrorResponse) => {
			// Skip refresh for auth-related endpoints and profile (handled by verifyAuth)
			const isAuthEndpoint =
				req.url.includes('/sessions/password') ||
				req.url.includes('/sessions/google') ||
				req.url.includes('/refresh') ||
				req.url.includes('/users') ||
				req.url.includes('/profile')

			if (error.status === 401 && !isAuthEndpoint && !isRefreshing) {
				isRefreshing = true

				return authService.refresh().pipe(
					switchMap(() => {
						isRefreshing = false
						return next(clonedRequest)
					}),
					catchError((refreshError) => {
						isRefreshing = false
						authService.clearAuth()
						router.navigate(['/login'])
						return throwError(() => refreshError)
					}),
				)
			}

			return throwError(() => error)
		}),
	)
}
