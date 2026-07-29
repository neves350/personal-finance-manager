/**
 * ENUMS
 */
export enum GoalType {
	SAVINGS = 'SAVINGS',
	SPENDING_LIMIT = 'SPENDING_LIMIT',
}

/**
 * GOAL
 */
export interface Goal {
	id?: string
	title: string
	amount: number
	currentAmount: number
	type: GoalType
	startDate: string
	endDate?: string
	categoryId?: string
	bankAccountId?: string
	progress: number
	isCompleted: boolean
	paceStatus: 'ON_TRACK' | 'OFF_PACE' | 'OVER_PACE' | 'COMPLETED'
	breakdown: {
		daily: number
		weekly: number
		monthly: number
		daysRemaining: number
	} | null
	category: { id: string; title: string; icon: string; type: string } | null
	bankAccount: {
		id: string
		name: string
		type: string
	} | null
	createdAt?: string
	updatedAt?: string
}

/**
 * CREATE GOAL
 */
export interface CreateGoalRequest {
	title: string
	amount: number
	type: GoalType
	startDate: string
	endDate?: string
	categoryId?: string
	bankAccountId?: string
}

/**
 * UPDATE GOAL
 */
export interface UpdateGoalRequest {
	title?: string
	amount?: number
	type?: GoalType
	startDate?: string
	endDate?: string
	categoryId?: string
	bankAccountId?: string
}

/**
 * CREATE RESPONSE
 */
export interface CreateGoalResponse {
	goal: Goal
	message: string
}

/**
 * GENERIC RESPONSE
 */
export interface GoalActionResponse {
	id: string
	message: string
}
