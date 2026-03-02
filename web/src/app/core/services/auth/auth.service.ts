import { computed, Injectable, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthApi } from '@core/api/auth/auth-api'
import type { AuthResponse } from '@core/api/auth/types/auth-response.type'
import type { LoginRequest } from '@core/api/auth/types/login-request.type'
import type { RegisterRequest } from '@core/api/auth/types/register-request.type'
import type { User } from '@core/api/auth/types/user.type'
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private readonly authApi = inject(AuthApi)
	private readonly router = inject(Router)

	readonly currentUser = signal<User | null>(null)
	readonly isAuthenticated = computed(() => this.currentUser() !== null)

	login(credentials: LoginRequest): Observable<User> {
		return this.authApi.login(credentials).pipe(
			map((response) => {
				if (response.user) {
					this.currentUser.set(response.user)
					return response.user
				}
				throw new Error('No user in response')
			}),
		)
	}

	googleLogin(credential: string): Observable<User> {
		return this.authApi.googleLogin(credential).pipe(
			map((response) => {
				if (response.user) {
					this.currentUser.set(response.user)
					return response.user
				}
				throw new Error('No user in response')
			}),
		)
	}

	register(data: RegisterRequest): Observable<User> {
		return this.authApi.register(data).pipe(
			map((response) => {
				if (response.user) {
					this.currentUser.set(response.user)
					return response.user
				}
				throw new Error('No user in response')
			}),
		)
	}

	refresh(): Observable<AuthResponse> {
		return this.authApi.refresh()
	}

	loadProfile(): Observable<User> {
		return this.authApi
			.getProfile()
			.pipe(tap((user) => this.currentUser.set(user)))
	}

	verifyAuth(): Observable<boolean> {
		if (this.currentUser()) {
			return of(true)
		}

		// Try to load profile first
		return this.loadProfile().pipe(
			map(() => true),
			catchError(() => {
				// Profile failed (likely expired token), try refreshing
				return this.refresh().pipe(
					switchMap(() => this.loadProfile()),
					map(() => true),
					catchError(() => {
						this.currentUser.set(null)
						return of(false)
					}),
				)
			}),
		)
	}

	requestPasswordRecover(email: string): Observable<string> {
		return this.authApi
			.requestPasswordRecover(email)
			.pipe(map((response) => response.message))
	}

	resetPassword(code: string, newPassword: string): Observable<string> {
		return this.authApi
			.resetPassword(code, newPassword)
			.pipe(map((response) => response.message))
	}

	logout(): void {
		this.authApi.logout().subscribe({
			complete: () => {
				this.currentUser.set(null)
				this.router.navigate(['/login'])
			},
			error: () => {
				this.currentUser.set(null)
				this.router.navigate(['/login'])
			},
		})
	}

	clearAuth(): void {
		this.currentUser.set(null)
	}
}
