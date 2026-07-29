import { ApiProperty } from '@nestjs/swagger'

export class TrendsResponseDto {
	@ApiProperty({
		description: 'Current period statistics',
		example: {
			period: 'Jan 2026',
			expenses: 1250.75,
			income: 3000.0,
			balance: 1749.25,
		},
	})
	current: {
		period: string
		expenses: number
		income: number
		balance: number
	}

	@ApiProperty({
		description: 'Previous period statistics',
		example: {
			period: 'Dec 2025',
			expenses: 1100.5,
			income: 2800.0,
			balance: 1699.5,
		},
	})
	previous: {
		period: string
		expenses: number
		income: number
		balance: number
	}

	@ApiProperty({
		description: 'Percentage changes',
		example: {
			expenses: '+13.65%',
			income: '+7.14%',
			balance: '+2.93%',
		},
	})
	change: {
		expenses: string
		income: string
		balance: string
	}
}
