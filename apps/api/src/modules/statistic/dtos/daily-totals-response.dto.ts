import { ApiProperty } from '@nestjs/swagger'

export class DailyTotalsResponseDto {
	@ApiProperty({ example: '2026-02-17, 2026-02-18' })
	labels: string[]

	@ApiProperty({ example: [200, 350, 100] })
	income: number[]

	@ApiProperty({ example: [150, 200, 180] })
	expenses: number[]

	@ApiProperty({ example: [50, 150, -80] })
	balance: number[]
}
