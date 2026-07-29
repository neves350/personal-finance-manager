import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsNotEmpty,
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

export class CreateTransactionDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	title: string

	@IsEnum(TransactionType)
	@IsNotEmpty()
	@ApiProperty({ enum: TransactionType })
	type: TransactionType

	@IsNumber()
	@IsNotEmpty()
	@IsPositive({ message: 'Amount must be greater than 0' })
	@ApiProperty()
	amount: number

	@Type(() => Date)
	@IsNotEmpty()
	@IsDate()
	@ApiProperty()
	date: Date

	@IsOptional()
	@IsBoolean()
	@ApiPropertyOptional()
	isPaid?: boolean

	@IsOptional()
	@IsString()
	@IsUUID()
	@ApiPropertyOptional()
	cardId?: string

	@IsString()
	@IsNotEmpty()
	@IsUUID()
	@ApiProperty()
	bankAccountId: string

	@IsString()
	@IsNotEmpty()
	@IsUUID()
	@ApiProperty()
	categoryId: string
}
