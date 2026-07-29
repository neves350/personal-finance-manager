import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'

enum CategoryType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export class UpdateCategoryDto {
	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	title?: string

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	icon?: string

	@IsEnum(CategoryType)
	@IsOptional()
	@ApiProperty({ enum: CategoryType, required: false })
	type?: CategoryType
}
