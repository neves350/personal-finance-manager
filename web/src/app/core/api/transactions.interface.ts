import type { CategoryType } from './categories.interface'

/**
 * ENUM
 */
export enum TransactionType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export enum TransactionSource {
	MANUAL = 'MANUAL',
	OPEN_BANKING = 'OPEN_BANKING',
}

/**
 * TRANSACTON
 */
export interface Transaction {
	id?: string
	cardId?: string
	bankAccountId: string
	categoryId: string
	recurringId?: string | null
	title: string
	type: TransactionType
	amount: number
	date: Date
	card?: TransactionCard
	bankAccount?: TransactionBankAccount
	category: TransactionCategory
	isPaid: boolean
	source?: TransactionSource
	externalId?: string
	createdAt?: string
	updatedAt?: string
}

export interface TransactionBankAccount {
	id: string
	name: string
	balance: number
}

export interface TransactionCard {
	id: string
	name: string
}

export interface TransactionCategory {
	id: string
	title: string
	type: CategoryType
	icon: string
}

/**
 * CREATE TRANSACTON
 */
export interface CreateTransactionRequest {
	title: string
	type: TransactionType
	amount: number
	date: Date
	bankAccountId: string
	categoryId: string
	cardId?: string
	isPaid?: boolean
}

/**
 * CREATE RESPONSE
 */
export interface CreateTransactionResponse {
	transaction: Transaction
	message: string
}

/**
 * UPDATE TRANSACTON
 */
export interface UpdateTransactionRequest {
	title?: string
	type?: TransactionType
	amount?: number
	date?: Date
	bankAccountId?: string
	categoryId?: string
	cardId?: string
	isPaid?: boolean
}

/**
 * QUERY PARAMS
 */
export interface TransactionsQueryParams {
	cardId?: string
	accountId?: string
	categoryId?: string
	type?: TransactionType
	startDate?: string
	endDate?: string
	page?: number
	limit?: number
}

/**
 * GENERIC RESPONSE
 */
export interface TransactionActionResponse {
	message: string
	success: boolean
}

export interface TransactionsResponse {
	data: Transaction[]
	meta: PaginationMeta
}

export interface PaginationMeta {
	total: number
	lastPage: number
	currentPage: number
	perPage: number
	prev: number | null
	next: number | null
}
