import { BankAccount } from './bank-accounts.interface'

/**
 * ENUMS
 */
export enum TransactionSource {
	MANUAL = 'MANUAL',
	OPEN_BANKING = 'OPEN_BANKING',
}

export enum ConnectionStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	DISABLED = 'DISABLED',
}

/**
 * OPEN BANKING CUSTOMER
 */
export interface OpenBankingCustomer {
	id?: string
	userId?: string
	saltEdgeCustomerId?: string
	createdAt?: string
	updatedAt?: string
	connections?: OpenBankingConnection[]
}

/**
 * OPEN BANKING ACCOUNT LINK
 */
export interface OpenBankingAccountLink {
	id: string
	bankAccount?: {
		id: string
		name: string
		balance: number
	}
}

/**
 * OPEN BANKING CONNECTION
 */
export interface OpenBankingConnection {
	id?: string
	customerId?: string
	saltEdgeConnectionId?: string
	providerCode?: string
	providerName?: string
	status?: ConnectionStatus
	consentExpiresAt?: string
	lastSyncAt?: string
	nextRefreshPossibleAt?: string
	createdAt?: string
	updatedAt?: string
	customer?: OpenBankingCustomer
	accounts?: OpenBankingAccount[]
}

/**
 * OPEN BANKING ACCOUNT
 */
export interface OpenBankingAccount {
	id?: string
	connectionId?: string
	bankAccountId?: string
	saltEdgeAccountId?: string
	iban?: string
	currencyCode?: string
	nature?: string
	lastSyncAt?: string
	createdAt?: string
	updatedAt?: string
	connection?: OpenBankingConnection
	bankAccount?: BankAccount
}

/**
 * CREATE CONNECT SESSION REQUEST
 */
export interface CreateConnectSessionRequest {
	providerCode: string
	returnTo: string
}

export interface ConnectSessionResponse {
	connectUrl: string
}

/**
 * OPEN BANKING PROVIDER
 */
export interface OpenBankingProvider {
	code: string
	name: string
	countryCode: string
	logoUrl: string
	status: string
}

/**
 * RESPONSES
 */
export interface OpenBankingConnectionsResponse {
	data: OpenBankingConnection[]
}

export interface OpenBankingConnectionDetailsResponse {
	data: OpenBankingConnection
}

export interface ProvidersResponse {
	data: OpenBankingProvider[]
}

/**
 * ACTIONS
 */
export interface RefreshConnectionResponse {
	message: string
}

export interface SyncConnectionResponse {
	message: string
}

export interface DisconnectBankRequest {
	keepData: boolean
}

export interface DisconnectBankResponse {
	message: string
}
