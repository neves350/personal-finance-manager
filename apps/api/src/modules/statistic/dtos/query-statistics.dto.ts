import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator'

export enum PeriodType {
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
}

export class QueryStatisticsDto {
	@IsOptional()
	@IsEnum(PeriodType, { message: 'Period must be one of: week, month, year' })
	@ApiPropertyOptional({ enum: PeriodType })
	period?: PeriodType

	@IsOptional()
	@IsUUID()
	@ApiPropertyOptional()
	bankAccountId?: string

	@IsOptional()
	@IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
	@ApiPropertyOptional()
	startDate?: string

	@IsOptional()
	@IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
	@ApiPropertyOptional()
	endDate?: string
}
