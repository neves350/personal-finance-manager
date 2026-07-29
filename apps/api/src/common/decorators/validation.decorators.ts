import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Matches } from 'class-validator'

/**
 * REGEX
 */
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[^\s]{6,}$/

/**
 * MESSAGES
 */
export const PASSWORD_RULES =
	'Minimum 6 characters, including uppercase, lowercase, numbers, and symbols.'

/**
 * DECORATORS
 */
export function EmailAddress(example = 'user@example.com') {
	return applyDecorators(
		Matches(EMAIL_REGEX, {
			message: 'Invalid e-mail',
		}),
		ApiProperty({
			example,
			format: 'email',
		}),
	)
}

export function StrongPassword(example = 'Str0ng!1') {
	return applyDecorators(
		Matches(PASSWORD_REGEX, {
			message: PASSWORD_RULES,
		}),
		ApiProperty({
			description: PASSWORD_RULES,
			example,
			minLength: 6,
		}),
	)
}
