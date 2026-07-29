import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from 'class-validator'

export class CreateDepositDto {
	@IsNumber()
	@IsNotEmpty()
	@IsPositive({ message: 'Deposit amount must be greater than 0' })
	@ApiProperty({
		example: 50,
		description: 'Amount to deposit towards the goal',
	})
	amount: number

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	@ApiPropertyOptional({ example: '2026-01-30' })
	date?: Date

	@IsString()
	@IsOptional()
	@ApiPropertyOptional({ example: 'Gym membership fee' })
	note?: string
}
