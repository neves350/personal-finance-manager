import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	ApiAddEnvelopeResponses,
	ApiCopyPreviousResponses,
	ApiCreateBudgetResponses,
	ApiDeleteBudgetResponses,
	ApiFindAllBudgetsResponses,
	ApiFindBudgetResponses,
	ApiRemoveEnvelopeResponses,
	ApiTransferEnvelopeResponses,
	ApiUpdateBudgetResponses,
	ApiUpdateEnvelopeResponses,
} from 'src/common/decorators/api-responses/budget-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BudgetService } from './budget.service'
import { CreateBudgetDto } from './dtos/create-budget.dto'
import { CreateEnvelopeDto } from './dtos/create-envelope.dto'
import { TransferEnvelopeDto } from './dtos/transfer-envelope.dto'
import { UpdateBudgetDto } from './dtos/update-budget.dto'
import { UpdateEnvelopeDto } from './dtos/update-envelope.dto'

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetController {
	constructor(private readonly budgetService: BudgetService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new budget',
		description: 'Creates a new budget with month, year and note.',
	})
	@ApiCreateBudgetResponses()
	async create(@Body() dto: CreateBudgetDto, @CurrentUser() user) {
		const budget = await this.budgetService.create(dto, user.userId)

		return {
			budget,
			message: 'Budget created successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'List all budgets',
		description:
			'Returns all budgets for the authenticated user, ordered by most recent.',
	})
	@ApiFindAllBudgetsResponses()
	async findAll(@CurrentUser() user) {
		return this.budgetService.findAll(user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Get('current')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get current month budget',
		description:
			'Returns the budget for the current month with envelopes and calculated spent amounts.',
	})
	@ApiFindBudgetResponses()
	async findCurrent(@CurrentUser() user) {
		return this.budgetService.findCurrent(user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update a budget',
		description: 'Updates the budget note. Month and year are immutable.',
	})
	@ApiUpdateBudgetResponses()
	async update(
		@CurrentUser() user,
		@Param('id') id: string,
		@Body() dto: UpdateBudgetDto,
	) {
		const budget = await this.budgetService.update(user.userId, id, dto)

		return {
			budget,
			message: 'Budget updated successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete a budget',
		description:
			'Permanently deletes a budget and all associated envelopes (cascade).',
	})
	@ApiDeleteBudgetResponses()
	async delete(@CurrentUser() user, @Param('id') id: string) {
		return this.budgetService.delete(user.userId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Post(':budgetId/envelopes')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Add envelope to budget',
		description:
			'Creates a new envelope linking an expense category to the budget with an allocated amount.',
	})
	@ApiAddEnvelopeResponses()
	async addEnvelope(
		@CurrentUser() user,
		@Param('budgetId') budgetId: string,
		@Body() dto: CreateEnvelopeDto,
	) {
		const envelope = await this.budgetService.addEnvelope(
			user.userId,
			budgetId,
			dto,
		)

		return {
			envelope,
			message: 'Envelope added successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':budgetId/envelopes/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update envelope allocation',
		description:
			'Updates the allocated amount of an envelope. The category is immutable.',
	})
	@ApiUpdateEnvelopeResponses()
	async updateEnvelope(
		@CurrentUser() user,
		@Param('budgetId') budgetId: string,
		@Param('id') id: string,
		@Body() dto: UpdateEnvelopeDto,
	) {
		const envelope = await this.budgetService.updateEnvelope(
			user.userId,
			budgetId,
			id,
			dto,
		)

		return {
			envelope,
			message: 'Envelope updated successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':budgetId/envelopes/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Remove envelope from budget',
		description: 'Permanently removes an envelope from the budget.',
	})
	@ApiRemoveEnvelopeResponses()
	async removeEnvelope(
		@CurrentUser() user,
		@Param('budgetId') budgetId: string,
		@Param('id') id: string,
	) {
		return this.budgetService.removeEnvelope(user.userId, budgetId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Post(':budgetId/envelopes/transfer')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Transfer between envelopes',
		description:
			'Moves allocated amount from one envelope to another within the same budget.',
	})
	@ApiTransferEnvelopeResponses()
	async transferEnvelopes(
		@CurrentUser() user,
		@Param('budgetId') budgetId: string,
		@Body() dto: TransferEnvelopeDto,
	) {
		const result = await this.budgetService.transferBetweenEnvelopes(
			user.userId,
			budgetId,
			dto,
		)

		return {
			...result,
			message: 'Transfer completed successfully',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Post(':id/copy-previous')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Copy previous month envelopes',
		description:
			'Copies all envelopes from the previous month budget into this one with the same categories and amounts.',
	})
	@ApiCopyPreviousResponses()
	async copyFromPrevious(@CurrentUser() user, @Param('id') id: string) {
		return this.budgetService.copyFromPrevious(user.userId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':year/:month')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get budget by month and year',
		description:
			'Returns a specific month budget with envelopes and calculated spent amounts.',
	})
	@ApiFindBudgetResponses()
	async findByMonthYear(
		@CurrentUser() user,
		@Param('year', ParseIntPipe) year: number,
		@Param('month', ParseIntPipe) month: number,
	) {
		return this.budgetService.findByMonthYear(user.userId, month, year)
	}
}
