import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
import {
	EmailAddress,
	PASSWORD_RULES,
	StrongPassword,
} from 'src/common/decorators/validation.decorators'

export class LoginUserDto {
	@IsEmail({}, { message: 'Required email' })
	@EmailAddress()
	@ApiProperty()
	email: string

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	password: string
}

export class RegisterUserDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	name: string

	@IsEmail({}, { message: 'Required email' })
	@EmailAddress()
	@ApiProperty()
	email: string

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	@StrongPassword()
	@ApiProperty({
		description: PASSWORD_RULES,
	})
	password: string
}
