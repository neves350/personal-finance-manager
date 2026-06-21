/**
 * TYPE
 */
export type EnvelopeStatus = 'on_track' | 'warning' | 'overspent'

/**
 * ENVELOPE
 */
export interface Envelope {
	id: string
	categoryId: string
	allocatedAmount: number
	spentAmount: number
	remainingAmount: number
	progress: number
	status: EnvelopeStatus
	category: {
		id: string
		title: string
		icon: string
		color?: string
		type: string
	}
}

/**
 * BUDGET SUMMARY
 */
export interface BudgetSummary {
	totalAllocated: number
	totalSpent: number
	totalRemaining: number
	envelopeCount: number
	overspentCount: number
	warningCount: number
}

/**
 * BUDGET
 */
export interface Budget {
	id: string
	month: number
	year: number
	note?: string
	envelopes: Envelope[]
	summary: BudgetSummary
	createdAt: string
	updatedAt: string
}

/**
 * BUDGET LIST ITEM
 */
export interface BudgetListItem {
	id: string
	month: number
	year: number
	note?: string
	createdAt: string
}

/**
 * CREATE BUDGET
 */
export interface CreateBudgetRequest {
	month: number
	year: number
	note?: string
}

/**
 * UPDATE BUDGET
 */
export interface UpdateBudgetRequest {
	note?: string
}

/**
 * CREATE ENVELOPE
 */
export interface CreateEnvelopeRequest {
	categoryId: string
	allocatedAmount: number
}

/**
 * UPDATE ENVELOPE
 */
export interface UpdateEnvelopeRequest {
	allocatedAmount: number
}

/**
 * TRANSFER ENVELOPE
 */
export interface TransferEnvelopeRequest {
	fromEnvelopeId: string
	toEnvelopeId: string
	amount: number
}

/**
 * CREATE RESPONSE
 */
export interface CreateBudgetResponse {
	budget: Budget
	message: string
}

/**
 * ENVELOPE RESPONSE
 */
export interface EnvelopeResponse {
	envelope: Envelope
	message: string
}

/**
 * TRANSFER RESPONSE
 */
export interface TransferEnvelopeResponse {
	from: Envelope
	to: Envelope
	message: string
}

/**
 * GENERIC RESPONSE
 */
export interface BudgetActionResponse {
	message: string
}
