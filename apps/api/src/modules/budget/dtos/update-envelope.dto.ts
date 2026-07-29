import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsPositive } from 'class-validator'

export class UpdateEnvelopeDto {
	@IsNumber()
	@IsPositive()
	@ApiProperty({ example: 500 })
	allocatedAmount!: number
}
