import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'src/generated/prisma/enums'

export class ExportTransactionsQueryDto {
	@ApiPropertyOptional({
		description: 'Account ID to filter (optional)',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsOptional()
	@IsUUID()
	accountId?: string

	@ApiPropertyOptional({
		description: 'Category ID to filter (optional)',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsOptional()
	@IsUUID()
	categoryId?: string

	@ApiPropertyOptional({
		description: 'Start date (YYYY-MM-DD)',
		example: '2024-01-01',
	})
	@IsOptional()
	@IsDateString()
	startDate?: string

	@ApiPropertyOptional({
		description: 'End date (YYYY-MM-DD)',
		example: '2024-12-31',
	})
	@IsOptional()
	@IsDateString()
	endDate?: string

	@ApiPropertyOptional({
		enum: Type,
		description: 'Transaction type filter (optional)',
		example: Type.EXPENSE,
	})
	@IsOptional()
	@IsEnum(Type)
	type?: Type
}
