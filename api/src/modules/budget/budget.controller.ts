import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BudgetService } from './budget.service'
import { CreateBudgetDto } from './dtos/create-budget.dto'
import { UpdateBudgetDto } from './dtos/update-budget.dto'

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
	async delete(@CurrentUser() user, @Param('id') id: string) {
		return this.budgetService.delete(user.userId, id)
	}

	@UseGuards(JwtAuthGuard)
	@Get(':year/:month')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get budget by month and year',
		description:
			'Returns a specific month budget with envelopes and calculated spent amounts.',
	})
	async findByMonthYear(
		@CurrentUser() user,
		@Param('year', ParseIntPipe) year: number,
		@Param('month', ParseIntPipe) month: number,
	) {
		return this.budgetService.findByMonthYear(user.userId, month, year)
	}
}
