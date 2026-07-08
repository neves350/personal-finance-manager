import {
	HttpErrorResponse,
	type HttpHandlerFn,
	type HttpInterceptorFn,
	type HttpRequest,
} from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { BackendReadinessService } from '@core/services/backend-readiness.service'
import { toast } from 'ngx-sonner'
import {
	catchError,
	delay,
	type Observable,
	of,
	Subject,
	switchMap,
	TimeoutError,
	throwError,
	timeout,
} from 'rxjs'

let isRefreshing = false
let isProbing = false
let probeSubject: Subject<void> | null = null

const STATUS_MESSAGES = [
	'Connecting to server...',
	'Server is starting up, please wait...',
	'Still connecting, this may take a moment...',
	'Almost there, hang tight...',
	'One last attempt...',
]

function isRetryableError(error: unknown): boolean {
	if (error instanceof TimeoutError) return true
	if (error instanceof HttpErrorResponse) {
		return [0, 500, 502, 503, 504].includes(error.status)
	}
	return false
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const readiness = inject(BackendReadinessService)
	const authService = inject(AuthService)
	const router = inject(Router)

	if (!readiness.ready()) {
		return warmUpThenHandle(req, next, readiness, authService, router)
	}

	return handleRequest(req, next, authService, router)
}

function warmUpThenHandle(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
	readiness: BackendReadinessService,
	authService: AuthService,
	router: Router,
): Observable<any> {
	if (isProbing) {
		return waitForProbe(req, next, authService, router)
	}

	isProbing = true
	probeSubject = new Subject<void>()
	readiness.markLoading(STATUS_MESSAGES[0])

	return executeProbe(req, next, readiness, authService, router, 0)
}

function waitForProbe(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
	authService: AuthService,
	router: Router,
): Observable<any> {
	return probeSubject!.pipe(
		switchMap(() => handleRequest(req, next, authService, router)),
	)
}

function executeProbe(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
	readiness: BackendReadinessService,
	authService: AuthService,
	router: Router,
	attempt: number,
): Observable<any> {
	const clonedRequest = req.clone({ withCredentials: true })

	return next(clonedRequest).pipe(
		timeout(readiness.config.timeoutMs),
		switchMap((response) => {
			probeSuccess(readiness)
			return of(response)
		}),
		catchError((error) => {
			if (!isRetryableError(error)) {
				probeSuccess(readiness)
				return handleRequest(req, next, authService, router)
			}

			const nextAttempt = attempt + 1
			if (nextAttempt >= readiness.config.maxAttempts) {
				return probeExhausted(readiness, error)
			}

			readiness.markLoading(STATUS_MESSAGES[nextAttempt])

			return of(null).pipe(
				delay(readiness.config.retryDelayMs),
				switchMap(() =>
					executeProbe(req, next, readiness, authService, router, nextAttempt),
				),
			)
		}),
	)
}

function probeSuccess(readiness: BackendReadinessService) {
	readiness.markReady()
	isProbing = false
	probeSubject?.next()
	probeSubject?.complete()
	probeSubject = null
}

function probeExhausted(
	readiness: BackendReadinessService,
	error: unknown,
): Observable<never> {
	readiness.markError()
	isProbing = false
	probeSubject?.error(error)
	probeSubject = null
	return throwError(() => error)
}

function handleRequest(
	req: HttpRequest<unknown>,
	next: HttpHandlerFn,
	authService: AuthService,
	router: Router,
): Observable<any> {
	const clonedRequest = req.clone({ withCredentials: true })

	return next(clonedRequest).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 429) {
				toast.error('Too many requests, please slow down')
				return throwError(() => error)
			}

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
