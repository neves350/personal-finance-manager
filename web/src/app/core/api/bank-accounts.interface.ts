/**
 * ENUMS
 */
export enum BankType {
	WALLET = 'WALLET',
	CHECKING = 'CHECKING',
	SAVINGS = 'SAVINGS',
	INVESTMENT = 'INVESTMENT',
}

/**
 * BANK ACCOUNT
 */
export interface BankAccount {
	id?: string
	name: string
	type: BankType
	balance: number
	initialBalance?: number
	totalMovements?: number
	isLinked?: boolean
	isCardAccount?: boolean
	bankLogo?: string
	createdAt?: string
	updatedAt?: string
}

/**
 * CREATE BANK ACCOUNT
 */
export interface CreateBankAccountRequest {
	name: string
	type: BankType
	balance: number
}

/**
 * UPDATE BANK ACCOUNT
 */
export interface UpdateBankAccountRequest {
	name?: string
	type?: BankType
	balance?: number
}

/**
 * CREATE RESPONSE
 */
export interface CreateBankAccountResponse {
	bankAccount: BankAccount
	message: string
}

/**
 * GENERIC RESPONSE
 */
export interface BankAccountActionResponse {
	message: string
	success: boolean
}

export interface BankAccountsResponse {
	data: BankAccount[]
	total: number
	count: number
}

/**
 * ACCOUNT BALANCE HISTORY
 */
export interface BalanceHistoryItem {
	month: number
	year: number
	balance: number
}

export interface BalanceHistoryResponse {
	data: BalanceHistoryItem[]
}

/**
 * ACCOUNT RECENT MOVEMENTS
 */
export interface Movement {
	id: string
	type: 'transaction' | 'transfer'
	amount: number
	date: string
	description: string
	transactionType?: 'INCOME' | 'EXPENSE'
	category?: {
		title: string
		type: string
	}
	fromAccount?: {
		id: string
		name: string
	}
	toAccount?: {
		id: string
		name: string
	}
}

export interface RecentMovementsResponse {
	data: Movement[]
}
