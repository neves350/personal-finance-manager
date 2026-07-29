import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create
 */
export function ApiCreateResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Card created successfully',
			schema: {
				example: {
					card: {
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						name: 'My Cash Wallet',
						type: 'CASH',
						balance: 1000.5,
						createdAt: '2026-01-15T10:30:00.000Z',
						updatedAt: '2026-01-15T10:30:00.000Z',
					},
					message: 'Card created successfully',
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
 * Update By Id
 */
export function ApiUpdateByIdResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Card successfully updated',
			schema: {
				example: {
					id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					name: 'John Doe Updated',
					avatarUrl: 'new-avatar.png',
					email: 'newemail@example.com',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid or missing token',
		}),
		ApiResponse({
			status: 403,
			description: 'You can only update your own profile',
		}),
		ApiResponse({
			status: 404,
			description: 'User not found',
		}),
		ApiResponse({
			status: 409,
			description: 'Email already exists',
		}),
	)
}

/**
 * Find All
 */
export function ApiFindAllResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of cards retrieved successfully',
			schema: {
				example: [
					{
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						name: 'My Cash Wallet',
						type: 'CASH',
						balance: 1000.5,
						createdAt: '2026-01-15T10:30:00.000Z',
						updatedAt: '2026-01-15T10:30:00.000Z',
					},
					{
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						name: 'Credit Card',
						type: 'CREDIT_CARD',
						balance: -250.0,
						createdAt: '2026-01-14T08:15:00.000Z',
						updatedAt: '2026-01-14T08:15:00.000Z',
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
 * Find One
 */
export function ApiFindOneResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Card retrieved successfully',
			schema: {
				example: {
					wallet: {
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						name: 'My Cash Wallet',
						type: 'CASH',
						balance: 1000.5,
						createdAt: '2026-01-15T10:30:00.000Z',
						updatedAt: '2026-01-15T10:30:00.000Z',
					},
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Wallet not found or does not belong to user',
		}),
	)
}

/**
 * Delete
 */
export function ApiDeleteResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Wallet deleted successfully',
			schema: {
				example: {
					message: 'Wallet deleted successfully',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Wallet not found or does not belong to user',
		}),
	)
}

/**
 * Monthly Expenses
 */
export function ApiMonthlyExpensesResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Your card monthly expenses',
			schema: {
				example: {
					card: {
						cardId: 'xxx',
						month: '2026-01',
						totalExpenses: 1500.0,
						totalIncome: 3000.0,
						balance: 1500.0,
					},
				},
			},
		}),
	)
}
