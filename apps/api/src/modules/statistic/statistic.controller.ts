import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
	ApiByCategoryResponses,
	ApiOverviewResponses,
	ApiTrendsResponses,
} from 'src/common/decorators/api-responses/statistic-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ByCategoryQueryDto } from './dtos/by-category-query.dto'
import { ByCategoryResponseDto } from './dtos/by-category-response.dto'
import { DailyTotalsResponseDto } from './dtos/daily-totals-response.dto'
import { OverviewResponseDto } from './dtos/overview-response.dto'
import { QueryStatisticsDto } from './dtos/query-statistics.dto'
import { TrendsResponseDto } from './dtos/trends-response-dto'
import { StatisticService } from './statistic.service'

@Throttle({ lenient: {} })
@ApiTags('Statistics')
@Controller('statistics')
export class StatisticController {
	constructor(readonly statisticService: StatisticService) {}

	@UseGuards(JwtAuthGuard)
	@Get('overview')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Finance Overview',
		description:
			'Returns totals, averages, counters, and top 3 expense categories. Useful for main dashboards.',
	})
	@ApiOverviewResponses()
	async overview(
		@CurrentUser() user,
		@Query() query: QueryStatisticsDto,
	): Promise<OverviewResponseDto> {
		return this.statisticService.getOverview(user.userId, query)
	}

	@UseGuards(JwtAuthGuard)
	@Get('by-category')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Breakdown by category',
		description: 'Groups transactions by category with value and percentages.',
	})
	@ApiByCategoryResponses()
	async byCategory(
		@CurrentUser() user,
		@Query() query: ByCategoryQueryDto,
	): Promise<ByCategoryResponseDto> {
		return this.statisticService.getByCategory(user.userId, query)
	}

	@UseGuards(JwtAuthGuard)
	@Get('trends')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Compare periods',
		description:
			'Compares current period with previous period and shows percentage changes in expenses, income, and balance.',
	})
	@ApiTrendsResponses()
	async trends(
		@CurrentUser() user,
		@Query() query: QueryStatisticsDto,
	): Promise<TrendsResponseDto> {
		return this.statisticService.getTrends(user.userId, query)
	}

	@UseGuards(JwtAuthGuard)
	@Get('daily-totals')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get daily totals',
		description:
			'Get the daily totals results about income, expenses and net balance.',
	})
	@ApiOkResponse({ type: DailyTotalsResponseDto })
	async dailyTotals(
		@CurrentUser() user,
		@Query() query: QueryStatisticsDto,
	): Promise<DailyTotalsResponseDto> {
		return this.statisticService.dailyTotals(user.userId, query)
	}
}
