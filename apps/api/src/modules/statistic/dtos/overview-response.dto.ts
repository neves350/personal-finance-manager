import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CategoryBreakdownItem } from './category-breakdown.dto'

export class OverviewResponseDto {
	// Totals
	@ApiProperty({ description: 'Total expenses', example: 1250.75 })
	totalExpenses: number

	@ApiProperty({ description: 'Total incomes', example: 3000.0 })
	totalIncome: number

	@ApiProperty({ description: 'Balance (income - expenses)', example: 1749.25 })
	balance: number

	// Transactions statistics
	@ApiProperty({ description: 'Total number of transactions', example: 45 })
	transactionCount: number

	@ApiProperty({ description: 'Number of expenses', example: 32 })
	expenseCount: number

	@ApiProperty({ description: 'Number of incomes', example: 13 })
	incomeCount: number

	// Averages
	@ApiProperty({ description: 'Average spend per transaction', example: 39.08 })
	averageExpense: number

	@ApiProperty({
		description: 'Average revenue per transaction',
		example: 230.77,
	})
	averageIncome: number

	// Top 3 categories expenses
	@ApiProperty({
		description: 'Top 3 categories where you spend the most',
		type: [CategoryBreakdownItem],
	})
	topExpenseCategories: CategoryBreakdownItem[]

	@ApiPropertyOptional({
		description: 'Comparison with the previous period',
	})
	comparisonWithPreviousPeriod?: {
		expensesChange: number
		incomeChange: number
		balanceChange: number
	}
}
