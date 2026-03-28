import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	ApiCreateResponses,
	ApiDeleteResponses,
	ApiFindAllResponses,
	ApiFindOneResponses,
	ApiUpdateByIdResponses,
} from 'src/common/decorators/api-responses/card-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CardService } from './card.service'
import { CreateCardDto } from './dtos/create-card.dto'
import { UpdateCardDto } from './dtos/update-card.dto'

@ApiTags('Cards')
@Controller()
export class CardController {
	constructor(readonly cardService: CardService) {}

	@UseGuards(JwtAuthGuard)
	@Post('cards')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new card',
		description: 'Creates a new card with name, color, type and last 4 digits.',
	})
	@ApiCreateResponses()
	async create(@Body() data: CreateCardDto, @CurrentUser() user) {
		const card = await this.cardService.create(data, user.userId)

		return {
			card,
			message: 'Card created successfull',
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('cards')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get all cards',
		description: 'Get all cards from user.',
	})
	@ApiFindAllResponses()
	async findAll(
		@CurrentUser() user,
		@Query('bankAccountId') bankAccountId?: string,
	) {
		const cards = await this.cardService.findAll(user.userId, bankAccountId)

		return cards
	}

	@UseGuards(JwtAuthGuard)
	@Get('cards/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get card by id',
		description: 'Get card for the user.',
	})
	@ApiFindOneResponses()
	async findOne(@Param('id') id: string, @CurrentUser() user) {
		const card = await this.cardService.findOne(id, user.userId)

		return { card }
	}

	@UseGuards(JwtAuthGuard)
	@Patch('cards/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update card by id',
		description: 'Updates the card information.',
	})
	@ApiUpdateByIdResponses()
	async updateById(
		@Param('id') id: string,
		@Body() data: UpdateCardDto,
		@CurrentUser() user,
	) {
		const updatedCard = await this.cardService.updateById(id, user.userId, data)

		return { updatedCard }
	}

	@UseGuards(JwtAuthGuard)
	@Delete('cards/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete card by id',
		description: 'Deletes the card information.',
	})
	@ApiDeleteResponses()
	async delete(@Param('id') id: string, @CurrentUser() user) {
		// Verify card ownership before deleting
		await this.cardService.findOne(id, user.userId)
		return this.cardService.delete(id)
	}

	@UseGuards(JwtAuthGuard)
	@Get('cards/:id/transactions')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get recent card transactions',
		description: 'Get recent transactions associated with a card.',
	})
	async getRecentTransactions(
		@Param('id') id: string,
		@Query('limit') limit: string,
		@CurrentUser() user,
	) {
		await this.cardService.findOne(id, user.userId)
		return this.cardService.getRecentTransactions(id, Number(limit) || 5)
	}

	@UseGuards(JwtAuthGuard)
	@Get('cards/:id/expenses')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get card monthly expenses',
		description: 'Get total expenses for a card within a date range.',
	})
	async getMonthlyExpenses(
		@Param('id') id: string,
		@Query('startDate') startDate: string,
		@Query('endDate') endDate: string,
		@CurrentUser() user,
	) {
		await this.cardService.findOne(id, user.userId)
		return this.cardService.monthlyExpenses(id, startDate, endDate)
	}

	@UseGuards(JwtAuthGuard)
	@Get('cards/:id/cashflow')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get card cashflow',
		description: 'Get monthly income/expense totals for the last 6 months.',
	})
	async getCashflow(@Param('id') id: string, @CurrentUser() user) {
		await this.cardService.findOne(id, user.userId)
		return this.cardService.getCashflow(id)
	}
}
