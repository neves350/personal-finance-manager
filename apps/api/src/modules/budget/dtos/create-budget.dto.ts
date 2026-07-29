import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateBudgetDto {
	@IsInt()
	@Min(1)
	@Max(12)
	@ApiProperty()
	month!: number

	@IsInt()
	@ApiProperty()
	year!: number

	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	note?: string
}
