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
import { Throttle } from '@nestjs/throttler'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateRecurringDto } from './dtos/create-recurring.dto'
import { UpdateRecurringDto } from './dtos/update-recurring.dto'
import { RecurringService } from './recurring.service'

@ApiTags('Recurrings')
@Controller('recurring')
export class RecurringController {
	constructor(private readonly recurringService: RecurringService) {}

	@UseGuards(JwtAuthGuard)
	@Post('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new recurring transaction',
		description:
			'Creates a new recurring transaction with description, amount, type, date.',
	})
	async create(@Body() dto: CreateRecurringDto, @CurrentUser() user) {
		const recurring = await this.recurringService.create(dto, user.userId)

		return {
			recurring,
			message: 'Recurring transaction create successfull',
		}
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Geat all recurring transactions',
		description: 'Get all recurring transactions.',
	})
	async findAll(@CurrentUser() user) {
		return this.recurringService.findAll(user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update recurring transaction by id',
		description: 'Updates the recurring transaction information.',
	})
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateRecurringDto,
		@CurrentUser() user,
	) {
		return this.recurringService.update(id, user.userId, dto)
	}

	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete recurring transaction by id',
		description: 'Deletes the recurring transaction information.',
	})
	async delete(
		@Param('id') id: string,
		@Query('deleteTransactions') deleteTransactions,
		@CurrentUser() user,
	) {
		return this.recurringService.delete(
			id,
			user.userId,
			deleteTransactions === 'true',
		)
	}
}
