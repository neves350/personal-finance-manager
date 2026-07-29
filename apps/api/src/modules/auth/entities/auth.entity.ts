import { ApiProperty } from '@nestjs/swagger'

/**
 * jwt shape
 */
export class AuthEntity {
	@ApiProperty()
	accessToken: string

	@ApiProperty()
	refreshToken: string
}
