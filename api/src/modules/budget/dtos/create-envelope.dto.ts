import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateEnvelopeDto {
	@IsUUID()
	@ApiProperty({ example: '1e79e7e4-89ec-490d-bad2-e197fe106f2b' })
	categoryId!: string

	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 300 })
	allocatedAmount!: number
}
