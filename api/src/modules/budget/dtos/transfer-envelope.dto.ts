import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsPositive, IsUUID } from 'class-validator'

export class TransferEnvelopeDto {
	@IsUUID()
	@ApiProperty({ example: '1e79e7e4-89ec-490d-bad2-e197fe106f2b' })
	fromEnvelopeId!: string

	@IsUUID()
	@ApiProperty({ example: '2a89e7e4-89ec-490d-bad2-e197fe106f2b' })
	toEnvelopeId!: string

	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 50 })
	amount!: number
}
