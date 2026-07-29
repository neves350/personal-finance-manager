import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
} from 'class-validator'

enum TransactionType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export class UpdateTransactionDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	title?: string

	@IsEnum(TransactionType)
	@IsOptional()
	@ApiPropertyOptional({ enum: TransactionType })
	type?: TransactionType

	@IsNumber()
	@IsOptional()
	@IsPositive({ message: 'Amount must be greater than 0' })
	@ApiPropertyOptional()
	amount?: number

	@Type(() => Date)
	@IsOptional()
	@IsDate()
	@ApiPropertyOptional()
	date?: Date

	@IsOptional()
	@IsBoolean()
	@ApiPropertyOptional()
	isPaid?: boolean

	@IsString()
	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional()
	cardId?: string

	@IsString()
	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional()
	bankAccountId?: string
}
