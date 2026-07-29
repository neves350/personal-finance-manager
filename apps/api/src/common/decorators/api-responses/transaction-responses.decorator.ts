import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create Transaction
 */
export function ApiCreateTransactionResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Transaction created successfully',
			schema: {
				example: {
					transaction: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						title: 'Grocery Shopping',
						type: 'EXPENSE',
						amount: 150.5,
						date: '2026-01-16T10:30:00.000Z',
						categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T10:30:00.000Z',
					},
					message: 'Transaction created successfully',
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
	)
}

/**
 * Find All Transactions
 */
export function ApiFindAllTransactionsResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of transactions retrieved successfully',
			schema: {
				example: [
					{
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						title: 'Grocery Shopping',
						type: 'EXPENSE',
						amount: 150.5,
						date: '2026-01-16T10:30:00.000Z',
						categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T10:30:00.000Z',
					},
					{
						id: 'b2c3d4e5-6789-01bc-def2-234567890abc',
						title: 'Monthly Salary',
						type: 'INCOME',
						amount: 3000.0,
						date: '2026-01-01T09:00:00.000Z',
						categoryId: 'g93fc60c-4018-4ac0-8606-efd160076df7',
						userId: 'user-123',
						createdAt: '2026-01-01T09:00:00.000Z',
						updatedAt: '2026-01-01T09:00:00.000Z',
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
 * Find One Transaction
 */
export function ApiFindOneTransactionResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Transaction retrieved successfully',
			schema: {
				example: {
					id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
					title: 'Grocery Shopping',
					type: 'EXPENSE',
					amount: 150.5,
					date: '2026-01-16T10:30:00.000Z',
					categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					userId: 'user-123',
					createdAt: '2026-01-16T10:30:00.000Z',
					updatedAt: '2026-01-16T10:30:00.000Z',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Transaction not found or does not belong to user',
		}),
	)
}

/**
 * Update Transaction
 */
export function ApiUpdateTransactionResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Transaction updated successfully',
			schema: {
				example: {
					id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
					title: 'Supermarket Shopping',
					type: 'EXPENSE',
					amount: 175.75,
					date: '2026-01-16T10:30:00.000Z',
					categoryId: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					userId: 'user-123',
					createdAt: '2026-01-16T10:30:00.000Z',
					updatedAt: '2026-01-16T14:45:00.000Z',
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
			status: 404,
			description: 'Transaction not found or does not belong to user',
		}),
	)
}

/**
 * Delete Transaction
 */
export function ApiDeleteTransactionResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Transaction deleted successfully',
			schema: {
				example: {
					message: 'Transaction deleted successfully',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Transaction not found or does not belong to user',
		}),
	)
}
