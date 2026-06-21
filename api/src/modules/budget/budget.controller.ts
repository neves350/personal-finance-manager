import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BudgetService } from './budget.service'
import { CreateBudgetDto } from './dtos/create-budget.dto'

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetController {
	constructor(private readonly budgetService: BudgetService) {}

	@UseGuards(JwtAuthGuard)
	@Post('')
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
}
