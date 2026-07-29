import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsDate,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	ValidateIf,
} from 'class-validator'
import { GoalType } from 'src/generated/prisma/enums'

export class CreateGoalDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({ example: 'Holidays 2026' })
	title: string

	@IsNumber()
	@IsNotEmpty()
	@IsPositive({ message: 'Amount must be greater than 0' })
	@ApiProperty({ example: 5000 })
	amount: number

	@IsEnum(GoalType)
	@IsNotEmpty()
	@ApiProperty({ enum: GoalType })
	type: GoalType

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	@ApiProperty({ example: '2026-01-30' })
	startDate: Date

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	@ApiPropertyOptional({ example: '2026-01-30' })
	endDate?: Date

	@IsUUID()
	@IsOptional()
	@ApiPropertyOptional({ example: '1e79e7e4-89ec-490d-bad2-e197fe106f2b' })
	bankAccountId?: string

	@IsUUID()
	@IsOptional()
	@ValidateIf((goal) => goal.type === GoalType.SPENDING_LIMIT)
	@ApiPropertyOptional({ example: '1e79e7e4-89ec-490d-bad2-e197fe106f2b' })
	categoryId?: string
}
