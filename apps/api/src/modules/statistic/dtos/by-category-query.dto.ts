import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { Type } from 'src/generated/prisma/enums'
import { QueryStatisticsDto } from './query-statistics.dto'

export class ByCategoryQueryDto extends QueryStatisticsDto {
	@ApiPropertyOptional({
		enum: Type,
		description: 'Type of transaction to analyze',
		example: Type.EXPENSE,
	})
	@IsOptional()
	@IsEnum(Type, {
		message: 'type must be INCOME or EXPENSE',
	})
	type?: Type = Type.EXPENSE // Default: EXPENSE
}
