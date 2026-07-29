import { ApiProperty } from '@nestjs/swagger'

export class CategoryBreakdownItem {
	@ApiProperty({ description: 'Category id' })
	categoryId: string

	@ApiProperty({ description: 'Category name', example: 'Food' })
	categoryTitle: string

	@ApiProperty({ description: 'Category icon', example: '🍔' })
	categoryIcon: string

	@ApiProperty({ description: 'Total', example: 450.5 })
	total: number

	@ApiProperty({ description: 'Total percentage', example: 35.5 })
	percentage: number

	@ApiProperty({ description: 'Transactions number', example: 12 })
	transactionCount: number
}
