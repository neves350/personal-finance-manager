import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export enum CategoryType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export class QueryCategoryDto {
	@IsOptional()
	@IsEnum(CategoryType)
	@ApiPropertyOptional({ enum: CategoryType })
	type?: CategoryType
}
