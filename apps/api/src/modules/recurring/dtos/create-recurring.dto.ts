import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsDate,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	Max,
	Min,
	ValidateIf,
} from 'class-validator'

export enum RecurringType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export enum FrequencyType {
	MONTH = 'MONTH',
	ANNUAL = 'ANNUAL',
}

export enum PaymentMethod {
	MONEY = 'MONEY',
	CARD = 'CARD',
}

export class CreateRecurringDto {
	@ApiProperty({ enum: RecurringType })
	@IsEnum(RecurringType)
	@IsNotEmpty()
	type: RecurringType

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	description: string

	@ApiProperty()
	@IsNumber()
	@IsNotEmpty()
	@IsPositive({ message: 'Amount must be greater than 0' })
	amount: number

	@ApiPropertyOptional()
	@IsInt()
	@Min(1)
	@Max(31)
	@IsOptional()
	monthDay?: number

	@IsEnum(FrequencyType)
	@IsNotEmpty()
	@ApiProperty({ enum: FrequencyType })
	frequency: FrequencyType

	@IsEnum(PaymentMethod)
	@ValidateIf((recurring) => recurring.type === RecurringType.EXPENSE)
	@IsOptional()
	@ApiProperty({ enum: PaymentMethod })
	paymentMethod?: PaymentMethod

	@ApiPropertyOptional()
	@ValidateIf((recurring) => recurring.type === RecurringType.EXPENSE)
	@IsOptional()
	@IsString()
	@IsUUID()
	cardId?: string

	@ApiProperty({ example: '2026-02-20' })
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	startDate: Date

	@ApiPropertyOptional({ example: '2026-02-20' })
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	endDate?: Date

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@IsUUID()
	bankAccountId: string

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@IsUUID()
	categoryId: string
}
