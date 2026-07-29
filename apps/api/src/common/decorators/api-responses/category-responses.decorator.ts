import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create
 */
export function ApiCreateResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Category found successfully',
			schema: {
				example: {
					category: {
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						title: 'Groceries',
						type: 'EXPENSE',
						icon: 'shopping-cart',
						createdAt: '2026-01-15T10:30:00.000Z',
						updatedAt: '2026-01-15T10:30:00.000Z',
					},
					message: 'Category created successfully',
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
 * Find All
 */
export function ApiFindAllResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of categories retrieved successfully',
			schema: {
				example: [
					{
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						title: 'Groceries',
						type: 'EXPENSE',
						icon: 'shopping-cart',
						createdAt: '2026-01-15T10:30:00.000Z',
						updatedAt: '2026-01-15T10:30:00.000Z',
					},
					{
						id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
						title: 'Salary',
						type: 'INCOME',
						icon: 'coins',
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
			description: 'Category retrieved successfully',
			schema: {
				example: {
					id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					title: 'Groceries',
					type: 'EXPENSE',
					icon: 'shopping-cart',
					createdAt: '2026-01-15T10:30:00.000Z',
					updatedAt: '2026-01-15T10:30:00.000Z',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Category not found or does not belong to user',
		}),
	)
}

/**
 * Update
 */
export function ApiUpdateResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Category updated successfully',
			schema: {
				example: {
					id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					title: 'Supermarket',
					type: 'EXPENSE',
					icon: 'shopping-cart',
					createdAt: '2026-01-15T10:30:00.000Z',
					updatedAt: '2026-01-15T14:45:00.000Z',
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
			description: 'Category not found or does not belong to user',
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
			description: 'Category deleted successfully',
			schema: {
				example: {
					message: 'Category deleted successfully',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Category not found or does not belong to user',
		}),
		ApiResponse({
			status: 409,
			description: 'Cannot delete category - it has associated transactions',
		}),
	)
}
