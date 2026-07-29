import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Register
 */
export function ApiCreateUserResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'User successfully registered',
			schema: {
				example: {
					name: 'John Doe',
					email: 'john@example.com',
					passwordHash: '@john.doe12',
				},
			},
		}),
		ApiResponse({
			status: 400,
			description: 'Empty request message',
		}),
		ApiResponse({
			status: 409,
			description: 'User already exists',
		}),
	)
}

/**
 * Login
 */
export function ApiLoginUserResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'User successfully logged in',
			schema: {
				example: {
					token:
						'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
				},
			},
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid password or e-mail',
		}),
	)
}

/**
 * Refresh
 */
export function ApiRefreshResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description:
				'Tokens refreshed successfully. New tokens sent as httpOnly cookies.',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * Profile
 */
export function ApiProfileUserResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'Profile retrieved successfully',
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
			description: 'Unauthorized',
		}),
	)
}

/**
 * Request Password Recover
 */
export function ApiRequestPasswordRecoverResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'If email exists, you will receive a recover link',
		}),
		ApiResponse({
			status: 400,
			description: 'Invalid e-mail',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * Reset Password
 */
export function ApiResetPasswordResponses() {
	return applyDecorators(
		ApiResponse({
			status: 201,
			description: 'Success on password reset',
		}),
		ApiResponse({
			status: 400,
			description:
				'Required token or a new password or password must be at least 6 characters',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * Logout
 */
export function ApiLogoutResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'User logged out successfully. Cookies cleared.',
		}),
	)
}
