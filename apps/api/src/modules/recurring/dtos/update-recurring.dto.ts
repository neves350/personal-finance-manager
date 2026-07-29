import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsBoolean,
	IsDate,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	Max,
	Min,
	ValidateIf,
} from 'class-validator'

enum RecurringType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

enum FrequencyType {
	MONTH = 'MONTH',
	ANNUAL = 'ANNUAL',
}

enum PaymentMethod {
	MONEY = 'MONEY',
	CARD = 'CARD',
}

export class UpdateRecurringDto {
	@ApiPropertyOptional({ enum: RecurringType })
	@IsEnum(RecurringType)
	@IsOptional()
	type?: RecurringType

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string

	@ApiPropertyOptional()
	@IsNumber()
	@IsOptional()
	@IsPositive({ message: 'Amount must be greater than 0' })
	amount?: number

	@ApiPropertyOptional()
	@IsInt()
	@Min(1)
	@Max(31)
	@IsOptional()
	monthDay?: number

	@ApiPropertyOptional({ enum: FrequencyType })
	@IsEnum(FrequencyType)
	@IsOptional()
	frequency?: FrequencyType

	@ApiPropertyOptional({ enum: PaymentMethod })
	@IsEnum(PaymentMethod)
	@ValidateIf((recurring) => recurring.type === RecurringType.EXPENSE)
	@IsOptional()
	paymentMethod?: PaymentMethod

	@ApiPropertyOptional()
	@ValidateIf((recurring) => recurring.type === RecurringType.EXPENSE)
	@IsOptional()
	@IsString()
	@IsUUID()
	cardId?: string

	@ApiPropertyOptional({ example: '2026-02-20' })
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	startDate?: Date

	@ApiPropertyOptional({ example: '2026-02-20' })
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	endDate?: Date

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	@IsUUID()
	bankAccountId?: string

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	@IsUUID()
	categoryId?: string

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	autoDetected?: boolean
}
