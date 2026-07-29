import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
	ApiAddDepositResponses,
	ApiCreateResponses,
	ApiDeleteResponses,
	ApiFindAllResponses,
	ApiFindOneResponses,
	ApiGetDepositsResponses,
	ApiUpdateResponses,
} from 'src/common/decorators/api-responses/goal-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateDepositDto } from './dtos/create-deposit.dto'
import { CreateGoalDto } from './dtos/create-goal.dto'
import { UpdateGoalDto } from './dtos/update-goal.dto'
import { GoalService } from './goal.service'

@ApiTags('Goals')
@Controller('goals')
export class GoalController {
	constructor(private readonly goalService: GoalService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new goal',
		description:
			'Creates a savings goal with automatic calculation of required savings',
	})
	@ApiCreateResponses()
	async create(@CurrentUser() user, @Body() dto: CreateGoalDto) {
		const goal = await this.goalService.create(user.userId, dto)

		return {
			goal,
			message: 'Goal created successfull',
		}
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get all goals with progress',
	})
	@ApiFindAllResponses()
	async findAll(@CurrentUser() user) {
		return this.goalService.findAll(user.userId)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get goal details',
		description:
			'Returns detailed goal information including heatmap data for deposit visualization',
	})
	@ApiFindOneResponses()
	async findOne(@CurrentUser() user, @Param('id') id: string) {
		return this.goalService.findOne(user.userId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update a goal',
		description: 'Updates goal details and recalculates savings breakdown',
	})
	@ApiUpdateResponses()
	async update(
		@CurrentUser() user,
		@Param('id') id: string,
		@Body() dto: UpdateGoalDto,
	) {
		const goal = await this.goalService.update(user.userId, id, dto)

		return {
			goal,
			message: 'Goal updated successfull',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete a goal',
		description: 'Permanently deletes a goal and all associated deposits',
	})
	@ApiDeleteResponses()
	async delete(@CurrentUser() user, @Param('id') id: string) {
		return this.goalService.delete(user.userId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/deposit')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Add deposit to goal',
		description:
			'Records a savings deposit and updates goal progress. Prevents exceeding target amount.',
	})
	@ApiAddDepositResponses()
	async addDeposit(
		@CurrentUser() user,
		@Param('id') id: string,
		@Body() data: CreateDepositDto,
	) {
		return this.goalService.addDeposit(user.userId, id, data)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id/deposits')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get deposit history',
		description: 'Returns all deposits made towards this goal ordered by date',
	})
	@ApiGetDepositsResponses()
	async getDeposits(@CurrentUser() user, @Param('id') id: string) {
		return this.goalService.getDeposits(user.userId, id)
	}
}
