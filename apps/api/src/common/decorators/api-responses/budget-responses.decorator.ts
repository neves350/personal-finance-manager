import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

const envelopeExample = {
	id: 'e1a2b3c4-5678-90ab-cdef-1234567890ab',
	categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
	allocatedAmount: 300,
	spentAmount: 220,
	remainingAmount: 80,
	progress: 73.33,
	status: 'on_track',
	category: {
		id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
		title: 'Groceries',
		icon: 'shopping-cart',
		color: '#22c55e',
		type: 'EXPENSE',
	},
}

const budgetWithEnvelopesExample = {
	id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
	userId: 'user-123',
	month: 6,
	year: 2026,
	note: 'June budget',
	createdAt: '2026-06-01T10:00:00.000Z',
	updatedAt: '2026-06-01T10:00:00.000Z',
	envelopes: [
		envelopeExample,
		{
			id: 'e2b3c4d5-6789-01bc-def2-234567890abc',
			categoryId: 'g93fc60c-4018-4ac0-8606-efd160076df7',
			allocatedAmount: 100,
			spentAmount: 95,
			remainingAmount: 5,
			progress: 95,
			status: 'warning',
			category: {
				id: 'g93fc60c-4018-4ac0-8606-efd160076df7',
				title: 'Transport',
				icon: 'car',
				color: '#f59e0b',
				type: 'EXPENSE',
			},
		},
	],
	summary: {
		totalAllocated: 400,
		totalSpent: 315,
		totalRemaining: 85,
		envelopeCount: 2,
		overspentCount: 0,
		warningCount: 1,
	},
}

/**
 * Create Budget
 */
export function ApiCreateBudgetResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Budget created successfully',
			schema: {
				example: {
					budget: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						month: 6,
						year: 2026,
						note: 'June budget',
						userId: 'user-123',
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-01T10:00:00.000Z',
					},
					message: 'Budget created successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Invalid input data',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 409,
			description: 'Budget for this month and year already exists',
		}),
	)
}

/**
 * Find All Budgets
 */
export function ApiFindAllBudgetsResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of budgets retrieved successfully',
			schema: {
				example: [
					{
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						month: 6,
						year: 2026,
						note: 'June budget',
						createdAt: '2026-06-01T10:00:00.000Z',
					},
					{
						id: 'b2c3d4e5-6789-01bc-def2-234567890abc',
						month: 5,
						year: 2026,
						note: null,
						createdAt: '2026-05-01T09:00:00.000Z',
					},
				],
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Find Budget (current or by month/year)
 */
export function ApiFindBudgetResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Budget retrieved successfully',
			schema: {
				example: budgetWithEnvelopesExample,
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'No budget found for this month and year',
		}),
	)
}

/**
 * Update Budget
 */
export function ApiUpdateBudgetResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Budget updated successfully',
			schema: {
				example: {
					budget: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						month: 6,
						year: 2026,
						note: 'Updated June budget',
						userId: 'user-123',
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-15T14:30:00.000Z',
					},
					message: 'Budget updated successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Budget not found or does not belong to user',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Delete Budget
 */
export function ApiDeleteBudgetResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Budget deleted successfully',
			schema: {
				example: {
					message: 'Budget deleted successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Budget not found or does not belong to user',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Add Envelope
 */
export function ApiAddEnvelopeResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Envelope added successfully',
			schema: {
				example: {
					envelope: {
						id: 'e1a2b3c4-5678-90ab-cdef-1234567890ab',
						budgetId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						allocatedAmount: 300,
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-01T10:00:00.000Z',
						category: {
							id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
							title: 'Groceries',
							icon: 'shopping-cart',
							color: '#22c55e',
							type: 'EXPENSE',
						},
					},
					message: 'Envelope added successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description:
				'Budget not found, category not found, or category is not EXPENSE',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 409,
			description: 'Category already has an envelope in this budget',
		}),
	)
}

/**
 * Update Envelope
 */
export function ApiUpdateEnvelopeResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Envelope updated successfully',
			schema: {
				example: {
					envelope: {
						id: 'e1a2b3c4-5678-90ab-cdef-1234567890ab',
						budgetId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						allocatedAmount: 500,
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-15T14:30:00.000Z',
						category: {
							id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
							title: 'Groceries',
							icon: 'shopping-cart',
							color: '#22c55e',
							type: 'EXPENSE',
						},
					},
					message: 'Envelope updated successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Envelope not found or does not belong to user',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Remove Envelope
 */
export function ApiRemoveEnvelopeResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Envelope removed successfully',
			schema: {
				example: {
					message: 'Envelope removed successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Envelope not found or does not belong to user',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Transfer Between Envelopes
 */
export function ApiTransferEnvelopeResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Transfer completed successfully',
			schema: {
				example: {
					from: {
						id: 'e1a2b3c4-5678-90ab-cdef-1234567890ab',
						budgetId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						allocatedAmount: 250,
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-15T14:30:00.000Z',
						category: {
							id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
							title: 'Groceries',
							icon: 'shopping-cart',
							color: '#22c55e',
							type: 'EXPENSE',
						},
					},
					to: {
						id: 'e2b3c4d5-6789-01bc-def2-234567890abc',
						budgetId: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						categoryId: 'g93fc60c-4018-4ac0-8606-efd160076df7',
						allocatedAmount: 150,
						createdAt: '2026-06-01T10:00:00.000Z',
						updatedAt: '2026-06-15T14:30:00.000Z',
						category: {
							id: 'g93fc60c-4018-4ac0-8606-efd160076df7',
							title: 'Transport',
							icon: 'car',
							color: '#f59e0b',
							type: 'EXPENSE',
						},
					},
					message: 'Transfer completed successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description:
				'Invalid envelopes, same envelope, or amount exceeds allocation',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
	)
}

/**
 * Copy Previous Month Envelopes
 */
export function ApiCopyPreviousResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Envelopes copied from previous month successfully',
			schema: {
				example: budgetWithEnvelopesExample,
			},
		}),
		ApiResponse({
			status: 400,
			description:
				'Budget not found, already has envelopes, or previous month has no envelopes',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'No budget found for the previous month',
		}),
	)
}
