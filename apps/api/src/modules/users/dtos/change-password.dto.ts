import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'
import {
	PASSWORD_RULES,
	StrongPassword,
} from 'src/common/decorators/validation.decorators'

export class ChangePasswordDto {
	@IsString()
	@MinLength(6, { message: 'Current password must be at least 6 characters' })
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	currentPassword: string

	@IsString()
	@MinLength(6, { message: 'New password must be at least 6 characters' })
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	newPassword: string

	@IsString()
	@MinLength(6, {
		message: 'Password confirmation must be at least 6 characters',
	})
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	confirmPassword: string
}
