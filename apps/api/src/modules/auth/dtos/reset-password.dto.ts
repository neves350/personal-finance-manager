import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'
import {
	PASSWORD_RULES,
	StrongPassword,
} from 'src/common/decorators/validation.decorators'

export class ResetPasswordDto {
	@IsString()
	@IsNotEmpty({ message: 'Required token' })
	@ApiProperty()
	code: string

	@IsString()
	@MinLength(6, { message: 'Password must be least 6 characters' })
	@IsNotEmpty({ message: 'Required new password' })
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	newPassword: string
}
