import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsDate,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	Validate,
} from 'class-validator'
import { DifferentAccountConstraint } from '../validators/different-account.validator'

export class TransferDto {
	@ApiProperty({ example: 90 })
	@IsNumber()
	@IsPositive({ message: 'Amount must be greater than 0' })
	amount: number

	@ApiProperty({ example: '53097297-11f5-4d41-9ef9-cce999ba838c' })
	@IsUUID()
	fromAccountId: string

	@ApiProperty({ example: '1e79e7e4-89ec-490d-bad2-e197fe106f2b' })
	@IsUUID()
	@Validate(DifferentAccountConstraint)
	toAccountId: string

	@ApiProperty({ example: '2026-01-30' })
	@Type(() => Date)
	@IsDate()
	date: Date

	@ApiProperty({ example: 'Birthday gift' })
	@IsString()
	@IsOptional()
	description?: string
}
