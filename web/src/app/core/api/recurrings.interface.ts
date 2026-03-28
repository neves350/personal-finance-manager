import type { CategoryType } from './categories.interface'

/**
 * ENUM
 */
export enum RecurringType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export enum FrequencyType {
	MONTH = 'MONTH',
	ANNUAL = 'ANNUAL',
}

export enum PaymentMethodType {
	MONEY = 'MONEY',
	CARD = 'CARD',
}

/**
 * RECURRING
 */
export interface Recurring {
	id?: string
	cardId?: string
	bankAccountId: string
	categoryId: string
	type: RecurringType
	description: string
	amount: number
	monthDay?: number
	frequency: FrequencyType
	paymentMethod?: PaymentMethodType
	startDate: Date
	endDate?: Date
	category: RecurringCategory
	autoDetected?: boolean
	createdAt?: string
	updatedAt?: string
}

export interface RecurringCategory {
	id: string
	title: string
	type: CategoryType
}

/**
 * CREATE RECURRING
 */
export interface CreateRecurringRequest {
	type: RecurringType
	description: string
	amount: number
	monthDay?: number
	frequency: FrequencyType
	paymentMethod?: PaymentMethodType
	startDate: Date
	endDate?: Date
	bankAccountId: string
	categoryId: string
	cardId?: string
}

/**
 * CREATE RESPONSE
 */
export interface CreateRecurringResponse {
	recurring: Recurring
	message: string
}

/**
 * UPDATE RECURRING
 */
export interface UpdateRecurringRequest {
	type?: RecurringType
	description?: string
	amount?: number
	monthDay?: number
	frequency?: FrequencyType
	paymentMethod?: PaymentMethodType
	startDate?: Date
	endDate?: Date
	bankAccountId?: string
	categoryId?: string
	cardId?: string
	autoDetected?: boolean
}

/**
 * GENERIC RESPONSE
 */
export interface RecurringActionResponse {
	message: string
}

export interface RecurringsResponse {
	recurrings: Recurring[]
	total: number
}
