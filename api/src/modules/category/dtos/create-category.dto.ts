import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

enum CategoryType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

export class CreateCategory {
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	title: string

	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	icon: string

	@IsString()
	@IsOptional()
	@ApiProperty()
	color?: string

	@IsEnum(CategoryType)
	@IsNotEmpty()
	@ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
	type: CategoryType
}
