import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateBudgetDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional()
	note?: string
}
