import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Find By Id
 */
export function ApiFindByIdResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'User found successfully',
			schema: {
				example: {
					id: 'f93fc60c-4018-4ac0-8606-efd160076df6',
					name: 'John Doe',
					avatarUrl: 'default.png',
					email: 'john@example.com',
					createdAt: '2024-01-15T10:30:00Z',
					updatedAt: '2024-01-15T10:30:00Z',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Not authenticated or invalid token',
		}),
		ApiResponse({
			status: 403,
			description: 'Cannot access data from other users',
		}),
		ApiResponse({
			status: 404,
			description: 'User not found',
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
			description: 'Profile deleted successfully',
			schema: {
				example: {
					message: 'Profile deleted successfully',
					success: true,
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Not authenticated or invalid token',
		}),
		ApiResponse({
			status: 404,
			description: 'User not found',
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
			description: 'User successfully updated',
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
 * Change Password
 */
export function ApiChangePasswordResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Password changed successfully',
			schema: {
				example: {
					message: 'Password changed successfully',
					success: true,
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Validation error or passwords do not match',
		}),
		ApiResponse({
			status: 401,
			description: 'Current password is incorrect or invalid token',
		}),
		ApiResponse({
			status: 404,
			description: 'User not found',
		}),
	)
}
