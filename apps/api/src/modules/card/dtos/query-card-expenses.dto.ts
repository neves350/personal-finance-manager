import { ApiProperty } from '@nestjs/swagger'
import { IsDateString } from 'class-validator'

export class QueryCardExpensesDto {
	@IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
	@ApiProperty({
		description: 'Start date for the expenses query',
		example: '2026-01-01',
	})
	startDate: string

	@IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
	@ApiProperty({
		description: 'End date for the expenses query',
		example: '2026-01-31',
	})
	endDate: string
}
