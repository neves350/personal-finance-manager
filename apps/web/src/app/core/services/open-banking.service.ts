import { computed, Injectable, inject, signal } from '@angular/core'
import { OpenBankingApi } from '@core/api/open-banking.api'
import {
	OpenBankingConnection,
	OpenBankingProvider,
} from '@core/api/open-banking.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class OpenBankingService {
	private readonly openBankingApi = inject(OpenBankingApi)

	// state
	readonly connections = signal<OpenBankingConnection[]>([])
	readonly providers = signal<OpenBankingProvider[]>([])
	readonly loading = signal(false)
	readonly error = signal<string | null>(null)

	// derived state
	readonly bankAccounts = computed(() =>
		this.connections()
			.flatMap((c) => c.accounts ?? [])
			.map((a) => a.bankAccount)
			.filter((account): account is NonNullable<typeof account> => !!account),
	)

	readonly hasConnections = computed(() => this.connections().length > 0)

	readonly activeConnections = computed(() =>
		this.connections().filter((c) => c.status === 'ACTIVE'),
	)

	loadConnections(): Observable<OpenBankingConnection[]> {
		this.loading.set(true)
		this.error.set(null)

		return this.openBankingApi.listConnections().pipe(
			tap({
				next: (response) => {
					this.connections.set(response.data)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load connections')
					this.loading.set(false)
				},
			}),
			map((response) => response.data),
		)
	}

	loadProviders(): Observable<OpenBankingProvider[]> {
		this.error.set(null)

		return this.openBankingApi.getProviders().pipe(
			tap({
				next: (res) => this.providers.set(res.data),
				error: (err) =>
					this.error.set(err.message || 'Failed to load providers'),
			}),
			map((res) => res.data),
		)
	}

	connectBank(providerCode: string): Observable<string> {
		return this.openBankingApi
			.createConnectSession({
				providerCode,
				returnTo: `${window.location.origin}/accounts?callback=success`,
			})
			.pipe(map((response) => response.connectUrl))
	}

	handleCallback() {
		return this.openBankingApi
			.handleCallback()
			.pipe(switchMap(() => this.loadConnections()))
	}

	refreshConnection(connectionId: string) {
		this.error.set(null)

		return this.openBankingApi.refreshConnection(connectionId).pipe(
			switchMap(() => this.loadConnections()),
			tap({
				error: (err) =>
					this.error.set(err.message || 'Failed to refresh connection'),
			}),
		)
	}

	syncConnection(connectionId: string) {
		this.error.set(null)

		return this.openBankingApi
			.syncConnection(connectionId)
			.pipe(switchMap(() => this.loadConnections()))
	}

	disconnect(connectionId: string, keepData: boolean) {
		this.error.set(null)

		return this.openBankingApi
			.disconnectBank(connectionId, { keepData })
			.pipe(switchMap(() => this.loadConnections()))
	}
}
