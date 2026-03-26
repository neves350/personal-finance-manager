import { HttpService } from '@nestjs/axios'
import { BadGatewayException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isAxiosError } from 'axios'
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
	private readonly baseUrl = 'https://www.saltedge.com/api/v6'
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

	private handleError(error: unknown, context: string): never {
		if (isAxiosError(error)) {
			const status = error.response?.status
			const saltEdgeError = error.response?.data?.error
			const message = saltEdgeError?.message ?? error.message
			const errorClass = saltEdgeError?.class ?? 'UnknownError'
			this.logger.error(
				`Salt Edge [${context}] ${status} ${errorClass}: ${message}`,
			)
			throw new BadGatewayException(
				`Salt Edge error (${errorClass}): ${message}`,
			)
		}
		throw error
	}

	// ─── Customers ─────────────────────────────────────────────────────

	async createCustomer(identifier: string): Promise<SaltEdgeCustomer> {
		try {
			const { data } = await firstValueFrom(
				this.http.post<SaltEdgeResponse<SaltEdgeCustomer>>(
					`${this.baseUrl}/customers`,
					{ data: { identifier } },
					{ headers: this.headers },
				),
			)
			this.logger.log(`Created Salt Edge customer: ${data.data.customer_id}`)
			return data.data
		} catch (error) {
			this.handleError(error, 'createCustomer')
		}
	}

	async getCustomerByIdentifier(
		identifier: string,
	): Promise<SaltEdgeCustomer | null> {
		try {
			const { data } = await firstValueFrom(
				this.http.get<{ data: SaltEdgeCustomer | SaltEdgeCustomer[] }>(
					`${this.baseUrl}/customers`,
					{
						headers: this.headers,
						params: { identifier },
					},
				),
			)
			// Salt Edge may return a single object or an array depending on the filter
			const customer = Array.isArray(data.data)
				? data.data[0]
				: data.data
			return customer ?? null
		} catch (error) {
			this.handleError(error, 'getCustomerByIdentifier')
		}
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
		const sessionData: Record<string, unknown> = {
			customer_id: params.customerId,
			consent: {
				scopes: params.consentScopes,
				from_date: params.consentFromDate,
			},
			attempt: {
				return_to: params.returnTo,
			},
		}

		if (params.providerCode) {
			sessionData.provider_code = params.providerCode
		} else {
			sessionData.allowed_countries = params.allowedCountries ?? ['PT']
		}

		const body = { data: sessionData }

		try {
			const { data } = await firstValueFrom(
				this.http.post<SaltEdgeResponse<SaltEdgeConnectSession>>(
					`${this.baseUrl}/connections/connect`,
					body,
					{ headers: this.headers },
				),
			)
			return data.data
		} catch (error) {
			this.handleError(error, 'createConnectSession')
		}
	}

	// ─── Connections ───────────────────────────────────────────────────

	async listConnections(customerId: string): Promise<SaltEdgeConnection[]> {
		try {
			const { data } = await firstValueFrom(
				this.http.get<SaltEdgeListResponse<SaltEdgeConnection>>(
					`${this.baseUrl}/connections`,
					{
						headers: this.headers,
						params: { customer_id: customerId },
					},
				),
			)
			return data.data
		} catch (error) {
			this.handleError(error, 'listConnections')
		}
	}

	async getConnection(connectionId: string): Promise<SaltEdgeConnection> {
		try {
			const { data } = await firstValueFrom(
				this.http.get<SaltEdgeResponse<SaltEdgeConnection>>(
					`${this.baseUrl}/connections/${connectionId}`,
					{ headers: this.headers },
				),
			)
			return data.data
		} catch (error) {
			this.handleError(error, 'getConnection')
		}
	}

	async refreshConnection(connectionId: string): Promise<SaltEdgeConnection> {
		try {
			const { data } = await firstValueFrom(
				this.http.post<SaltEdgeResponse<SaltEdgeConnection>>(
					`${this.baseUrl}/connections/${connectionId}/refresh`,
					{ data: {} },
					{ headers: this.headers },
				),
			)
			return data.data
		} catch (error) {
			this.handleError(error, 'refreshConnection')
		}
	}

	async removeConnection(connectionId: string): Promise<void> {
		try {
			await firstValueFrom(
				this.http.delete(`${this.baseUrl}/connections/${connectionId}`, {
					headers: this.headers,
				}),
			)
			this.logger.log(`Removed Salt Edge connection: ${connectionId}`)
		} catch (error) {
			this.handleError(error, 'removeConnection')
		}
	}

	// ─── Accounts ──────────────────────────────────────────────────────

	async getAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
		try {
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
		} catch (error) {
			this.handleError(error, 'getAccounts')
		}
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
		try {
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
		} catch (error) {
			this.handleError(error, 'getTransactions')
		}

		return allTransactions
	}

	// ─── Providers ─────────────────────────────────────────────────────

	async getProviders(countryCode = 'PT'): Promise<SaltEdgeProvider[]> {
		try {
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
		} catch (error) {
			this.handleError(error, 'getProviders')
		}
	}
}
