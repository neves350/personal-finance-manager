import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Create Transfer
 */
export function ApiCreateTransferResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Transfer created successfully',
			schema: {
				example: {
					transfer: {
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						amount: 90,
						fromAccountId: '53097297-11f5-4d41-9ef9-cce999ba838c',
						toAccountId: '1e79e7e4-89ec-490d-bad2-e197fe106f2b',
						date: '2026-01-30T00:00:00.000Z',
						description: 'Birthday gift',
						userId: 'user-123',
						createdAt: '2026-01-30T10:30:00.000Z',
						updatedAt: '2026-01-30T10:30:00.000Z',
					},
					message: 'Transfer created successfully',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Invalid input data or same account transfer',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Source or destination account not found',
		}),
	)
}

/**
 * Find All Transfers
 */
export function ApiFindAllTransfersResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'List of transfers retrieved successfully',
			schema: {
				example: [
					{
						id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
						amount: 90,
						fromAccountId: '53097297-11f5-4d41-9ef9-cce999ba838c',
						toAccountId: '1e79e7e4-89ec-490d-bad2-e197fe106f2b',
						date: '2026-01-30T00:00:00.000Z',
						description: 'Birthday gift',
						userId: 'user-123',
						createdAt: '2026-01-30T10:30:00.000Z',
						updatedAt: '2026-01-30T10:30:00.000Z',
					},
					{
						id: 'b2c3d4e5-6789-01bc-def2-234567890abc',
						amount: 500,
						fromAccountId: '1e79e7e4-89ec-490d-bad2-e197fe106f2b',
						toAccountId: '53097297-11f5-4d41-9ef9-cce999ba838c',
						date: '2026-01-15T00:00:00.000Z',
						description: 'Savings transfer',
						userId: 'user-123',
						createdAt: '2026-01-15T09:00:00.000Z',
						updatedAt: '2026-01-15T09:00:00.000Z',
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
 * Find One Transfer
 */
export function ApiFindOneTransferResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Transfer retrieved successfully',
			schema: {
				example: {
					id: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
					amount: 90,
					fromAccountId: '53097297-11f5-4d41-9ef9-cce999ba838c',
					toAccountId: '1e79e7e4-89ec-490d-bad2-e197fe106f2b',
					date: '2026-01-30T00:00:00.000Z',
					description: 'Birthday gift',
					userId: 'user-123',
					createdAt: '2026-01-30T10:30:00.000Z',
					updatedAt: '2026-01-30T10:30:00.000Z',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized - Invalid or missing token',
		}),
		ApiResponse({
			status: 404,
			description: 'Transfer not found or does not belong to user',
		}),
	)
}
