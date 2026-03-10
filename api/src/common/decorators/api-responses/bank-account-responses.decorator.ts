import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create Bank Account
 */
export function ApiCreateBankAccountResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Bank account created successfully',
			schema: {
				example: {
					bankAccount: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						name: 'Revolut Credit Card',
						type: 'CHECKING',
						balance: 1500.0,
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T10:30:00.000Z',
					},
					message: 'Bank account created successfully',
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
 * Find All Bank Accounts
 */
export function ApiFindAllBankAccountsResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of bank accounts retrieved successfully',
			schema: {
				example: [
					{
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						name: 'Revolut Credit Card',
						type: 'CHECKING',
						balance: 1500.0,
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T10:30:00.000Z',
					},
					{
						id: 'b2c3d4e5-6789-01bc-def2-234567890abc',
						name: 'Main Savings Account',
						type: 'SAVINGS',
						balance: 5000.0,
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
 * Find One Bank Account
 */
export function ApiFindOneBankAccountResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Bank account retrieved successfully',
			schema: {
				example: {
					card: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						name: 'Revolut Credit Card',
						type: 'CHECKING',
						balance: 1500.0,
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T10:30:00.000Z',
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
			description: 'Bank account not found or does not belong to user',
		}),
	)
}

/**
 * Update Bank Account
 */
export function ApiUpdateBankAccountResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Bank account updated successfully',
			schema: {
				example: {
					updatedBankAccount: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						name: 'Revolut Premium Card',
						type: 'CHECKING',
						balance: 2000.0,
						userId: 'user-123',
						createdAt: '2026-01-16T10:30:00.000Z',
						updatedAt: '2026-01-16T14:45:00.000Z',
					},
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
			description: 'Bank account not found or does not belong to user',
		}),
	)
}

/**
 * Delete Bank Account
 */
export function ApiDeleteBankAccountResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Bank account deleted successfully',
			schema: {
				example: {
					message: 'Bank account deleted successfully',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Bank account not found or does not belong to user',
		}),
	)
}
