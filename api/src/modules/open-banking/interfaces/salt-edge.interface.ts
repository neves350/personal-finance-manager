/**
 * Salt Edge API Response Types
 */
export interface SaltEdgeCustomer {
	id: string
	identifier: string
	secret: string
}

export interface SaltEdgeConnectSession {
	expires_at: string
	connect_url: string
}

export interface SaltEdgeConnection {
	id: string
	provider_code: string
	provider_name: string
	status: string
	next_refresh_possible_at: string | null
	last_success_at: string | null
	consent: {
		scopes: string[]
		expires_at: string | null
	}
}

export interface SaltEdgeAccount {
	id: string
	connection_id: string
	name: string
	nature: string
	balance: number
	currency_code: string
	iban: string | null
	extra: Record<string, unknown>
}

export interface SaltEdgeTransaction {
	id: string
	account_id: string
	duplicated: boolean
	mode: string
	status: string
	made_on: string
	amount: number
	currency_code: string
	description: string
	category: string
	extra: Record<string, unknown>
}

export interface SaltEdgeProvider {
	code: string
	name: string
	country_code: string
	logo_url: string
	status: string
}

/**
 * Salt Edge API Wrapper Responses
 */
export interface SaltEdgeResponse<T> {
	data: T
}

export interface SaltEdgeListResponse<T> {
	data: T[]
	meta: {
		next_id?: string
		next_page?: string
	}
}

/**
 * Webhook Payload
 */
export interface SaltEdgeWebhookPayload {
	data: {
		connection_id: string
		customer_id: string
		custom_fields: Record<string, unknown>
		stage: string
	}
	meta: {
		version: string
		time: string
	}
}
