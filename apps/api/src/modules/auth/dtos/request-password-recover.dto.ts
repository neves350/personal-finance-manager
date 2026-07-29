import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { EmailAddress } from 'src/common/decorators/validation.decorators'

export class ForgotPasswordDto {
	@IsEmail()
	@IsNotEmpty({ message: 'Required email' })
	@EmailAddress()
	@ApiProperty()
	email: string
}
