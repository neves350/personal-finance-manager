import { Injectable, signal } from '@angular/core'

@Injectable({
	providedIn: 'root',
})
export class BackendReadinessService {
	readonly ready = signal(false) // flips to true on first successful response
	readonly loading = signal(false) // true while the probe retry loop is active
	readonly error = signal(false) // true when all attempts are exhausted
	readonly statusMessage = signal('Connecting to server...') // user-facing message displayed under the spinner

	readonly config = {
		maxAttempts: 5,
		timeoutMs: 10_000,
		retryDelayMs: 10_000,
	} as const

	markReady() {
		this.ready.set(true)
		this.loading.set(false)
		this.error.set(false)
	}

	markLoading(message: string) {
		this.loading.set(true)
		this.statusMessage.set(message)
	}

	markError() {
		this.loading.set(false)
		this.error.set(true)
		this.statusMessage.set('Unable to reach the server')
	}

	reset() {
		this.ready.set(false)
		this.loading.set(false)
		this.error.set(false)
		this.statusMessage.set('')
	}
}
