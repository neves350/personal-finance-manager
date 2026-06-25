import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator'

export class QueryNotificationDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@ApiPropertyOptional()
	page?: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	@ApiPropertyOptional()
	limit?: number = 20

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true' || value === true)
	@ApiPropertyOptional({ description: 'Filter by read status' })
	isRead?: boolean

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({ description: 'Search by title or message' })
	search?: string
}
