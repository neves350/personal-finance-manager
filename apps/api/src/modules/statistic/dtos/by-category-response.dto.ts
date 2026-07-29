import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'src/generated/prisma/enums'
import { CategoryBreakdownItem } from './category-breakdown.dto'

export class ByCategoryResponseDto {
	@ApiProperty({
		description: 'Types of transactions analyzed',
		enum: Type,
	})
	type: Type

	@ApiProperty({
		description: 'Grand total (sum of all categories)',
		example: 1250.75,
	})
	totalAmount: number

	@ApiProperty({ description: 'Total number of transactions', example: 45 })
	totalTransactions: number

	@ApiProperty({
		description: 'Breakdown by category (ordered from largest to smallest)',
		type: [CategoryBreakdownItem],
	})
	categories: CategoryBreakdownItem[]
}
