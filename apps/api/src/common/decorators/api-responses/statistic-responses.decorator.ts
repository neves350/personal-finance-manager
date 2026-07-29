import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ByCategoryResponseDto } from 'src/modules/statistic/dtos/by-category-response.dto'
import { OverviewResponseDto } from 'src/modules/statistic/dtos/overview-response.dto'
import { TrendsResponseDto } from 'src/modules/statistic/dtos/trends-response-dto'

/**
 * Overview
 */
export function ApiOverviewResponses() {
	return applyDecorators(
		ApiOperation({
			summary: 'Financial overview',
			description:
				'Returns total expenses, income, balance, averages, and top 3 expense categories. Perfect for main dashboard.',
		}),
		ApiResponse({
			status: 200,
			description: 'Statistics retrieved successfully',
			type: OverviewResponseDto,
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * By Category
 */
export function ApiByCategoryResponses() {
	return applyDecorators(
		ApiOperation({
			summary: 'Breakdown by category',
			description:
				'Groups transactions by category with amounts and percentages. Perfect for pie/donut charts.',
		}),
		ApiResponse({
			status: 200,
			description: 'Category breakdown retrieved successfully',
			type: ByCategoryResponseDto,
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * Trends
 */
export function ApiTrendsResponses() {
	return applyDecorators(
		ApiOperation({
			summary: 'Period comparison',
			description:
				'Compares current period with previous period and shows percentage changes.',
		}),
		ApiResponse({
			status: 200,
			description: 'Trends retrieved successfully',
			type: TrendsResponseDto,
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}
