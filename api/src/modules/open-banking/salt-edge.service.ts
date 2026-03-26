import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import type {
	SaltEdgeAccount,
	SaltEdgeConnection,
	SaltEdgeConnectSession,
	SaltEdgeCustomer,
	SaltEdgeListResponse,
	SaltEdgeProvider,
	SaltEdgeResponse,
	SaltEdgeTransaction,
} from './interfaces/salt-edge.interface'

@Injectable()
export class SaltEdgeService {
	private readonly logger = new Logger(SaltEdgeService.name)
	private readonly baseUrl = 'https://www.saltedge.com/api/v5'
	private readonly appId: string
	private readonly secret: string

	constructor(
		private readonly http: HttpService,
		private readonly config: ConfigService,
	) {
		this.appId = this.config.getOrThrow<string>('SALT_EDGE_APP_ID')
		this.secret = this.config.getOrThrow<string>('SALT_EDGE_SECRET')
	}

	private get headers() {
		return {
			'App-id': this.appId,
			Secret: this.secret,
			'Content-Type': 'application/json',
		}
	}

	// ─── Customers ─────────────────────────────────────────────────────

	async createCustomer(identifier: string): Promise<SaltEdgeCustomer> {
		const { data } = await firstValueFrom(
			this.http.post<SaltEdgeResponse<SaltEdgeCustomer>>(
				`${this.baseUrl}/customers`,
				{ data: { identifier } },
				{ headers: this.headers },
			),
		)
		this.logger.log(`Created Salt Edge customer: ${data.data.id}`)
		return data.data
	}

	// ─── Connect Sessions ──────────────────────────────────────────────

	async createConnectSession(params: {
		customerId: string
		consentScopes: string[]
		consentFromDate: string
		returnTo: string
		providerCode?: string
		allowedCountries?: string[]
	}): Promise<SaltEdgeConnectSession> {
		const body: Record<string, unknown> = {
			data: {
				customer_id: params.customerId,
				consent: {
					scopes: params.consentScopes,
					from_date: params.consentFromDate,
				},
				attempt: {
					return_to: params.returnTo,
				},
				allowed_countries: params.allowedCountries ?? ['PT'],
			},
		}

		if (params.providerCode) {
			;(body.data as Record<string, unknown>).provider_code =
				params.providerCode
		}

		const { data } = await firstValueFrom(
			this.http.post<SaltEdgeResponse<SaltEdgeConnectSession>>(
				`${this.baseUrl}/connect_sessions/create`,
				body,
				{ headers: this.headers },
			),
		)
		return data.data
	}

	// ─── Connections ───────────────────────────────────────────────────

	async getConnection(connectionId: string): Promise<SaltEdgeConnection> {
		const { data } = await firstValueFrom(
			this.http.get<SaltEdgeResponse<SaltEdgeConnection>>(
				`${this.baseUrl}/connections/${connectionId}`,
				{ headers: this.headers },
			),
		)
		return data.data
	}

	async refreshConnection(connectionId: string): Promise<SaltEdgeConnection> {
		const { data } = await firstValueFrom(
			this.http.put<SaltEdgeResponse<SaltEdgeConnection>>(
				`${this.baseUrl}/connections/${connectionId}/refresh`,
				{ data: {} },
				{ headers: this.headers },
			),
		)
		return data.data
	}

	async removeConnection(connectionId: string): Promise<void> {
		await firstValueFrom(
			this.http.delete(`${this.baseUrl}/connections/${connectionId}`, {
				headers: this.headers,
			}),
		)
		this.logger.log(`Removed Salt Edge connection: ${connectionId}`)
	}

	// ─── Accounts ──────────────────────────────────────────────────────

	async getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
		const { data } = await firstValueFrom(
			this.http.get<SaltEdgeListResponse<SaltEdgeAccount>>(
				`${this.baseUrl}/accounts`,
				{
					headers: this.headers,
					params: { connection_id: connectionId },
				},
			),
		)
		return data.data
	}

	// ─── Transactions ──────────────────────────────────────────────────

	async getTransactions(params: {
		connectionId: string
		accountId: string
		fromDate: string
	}): Promise<SaltEdgeTransaction[]> {
		const allTransactions: SaltEdgeTransaction[] = []
		let nextId: string | undefined

		// Paginate through all transactions
		do {
			const queryParams: Record<string, string> = {
				connection_id: params.connectionId,
				account_id: params.accountId,
				from_date: params.fromDate,
			}
			if (nextId) {
				queryParams.from_id = nextId
			}

			const { data } = await firstValueFrom(
				this.http.get<SaltEdgeListResponse<SaltEdgeTransaction>>(
					`${this.baseUrl}/transactions`,
					{
						headers: this.headers,
						params: queryParams,
					},
				),
			)

			allTransactions.push(...data.data)
			nextId = data.meta.next_id
		} while (nextId)

		return allTransactions
	}

	// ─── Providers ─────────────────────────────────────────────────────

	async getProviders(countryCode = 'PT'): Promise<SaltEdgeProvider[]> {
		const { data } = await firstValueFrom(
			this.http.get<SaltEdgeListResponse<SaltEdgeProvider>>(
				`${this.baseUrl}/providers`,
				{
					headers: this.headers,
					params: { country_code: countryCode },
				},
			),
		)
		return data.data
	}
}
