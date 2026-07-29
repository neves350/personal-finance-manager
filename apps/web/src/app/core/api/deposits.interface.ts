import type { Goal } from './goals.interface'

/**
 * DEPOSIT
 */
export interface Deposit {
	id: string
	goalId: string
	amount: number
	date: string
	note?: string
	createdAt: string
}

/**
 * ADD DEPOSIT
 */
export interface AddDepositRequest {
	amount: number
	date: string
	note?: string
}

export interface AddDepositResponse {
	deposit: Deposit
	goal: Goal
	message: string
}

/**
 * GET DEPOSITS
 */
export interface GetDepositsResponse {
	goalId: string
	totalDeposits: number
	totalAmount: number
	deposits: Deposit[]
}
