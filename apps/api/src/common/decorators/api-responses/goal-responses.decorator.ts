import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create
 */
export function ApiCreateResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Goal created successfully',
		}),
		ApiResponse({
			status: 400,
			description: 'Invalid input data',
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
			description: 'Goals retrieved successfully',
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
			description: 'Goal details retrieved successfully',
		}),
		ApiResponse({
			status: 404,
			description: 'Goal not found',
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
			description: 'Goal updated successfully',
		}),
		ApiResponse({
			status: 404,
			description: 'Goal not found',
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
			description: 'Goal deleted successfully',
		}),
		ApiResponse({
			status: 404,
			description: 'Goal not found',
		}),
	)
}

/**
 * Add Deposit
 */
export function ApiAddDepositResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Deposit added successfully',
		}),
		ApiResponse({
			status: 400,
			description: 'Goal already completed or invalid amount',
		}),
		ApiResponse({
			status: 404,
			description: 'Goal not found',
		}),
	)
}

/**
 * Get Deposits
 */
export function ApiGetDepositsResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Deposits retrieved successfully',
		}),
		ApiResponse({
			status: 404,
			description: 'Goal not found',
		}),
	)
}
