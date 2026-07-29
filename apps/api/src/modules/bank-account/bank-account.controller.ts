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
	ApiCreateBankAccountResponses,
	ApiDeleteBankAccountResponses,
	ApiFindAllBankAccountsResponses,
	ApiFindOneBankAccountResponses,
	ApiUpdateBankAccountResponses,
} from 'src/common/decorators/api-responses/bank-account-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { BankAccountService } from './bank-account.service'
import { CreateBankAccountDto } from './dtos/create-bank-account.dto'
import { UpdateBankAccountDto } from './dtos/update-bank-account.dto'

@ApiTags('Bank Accounts')
@Controller('bank-account')
export class BankAccountController {
	constructor(readonly bankAccountService: BankAccountService) {}

	@UseGuards(JwtAuthGuard)
	@Post('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new bank account',
		description:
			'Creates a new bank account with name, type, currency and balance.',
	})
	@ApiCreateBankAccountResponses()
	async create(@Body() data: CreateBankAccountDto, @CurrentUser() user) {
		const bankAccount = await this.bankAccountService.create(data, user.userId)

		return {
			bankAccount,
			message: 'Bank account created successfull',
		}
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get all bank accounts',
		description: 'Get all bank accounts from user.',
	})
	@ApiFindAllBankAccountsResponses()
	async findAll(@CurrentUser() user) {
		const bankAccounts = await this.bankAccountService.findAll(user.userId)

		return bankAccounts
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get bank account by id',
		description: 'Get bank account for the user.',
	})
	@ApiFindOneBankAccountResponses()
	async findOne(@Param('id') id: string, @CurrentUser() user) {
		const card = await this.bankAccountService.findOne(id, user.userId)

		return { card }
	}

	@UseGuards(JwtAuthGuard)
	@Patch('/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update bank account by id',
		description: 'Updates the bank account information.',
	})
	@ApiUpdateBankAccountResponses()
	async update(
		@Param('id') id: string,
		@Body() data: UpdateBankAccountDto,
		@CurrentUser() user,
	) {
		const updatedBankAccount = await this.bankAccountService.update(
			id,
			user.userId,
			data,
		)

		return { updatedBankAccount }
	}

	@UseGuards(JwtAuthGuard)
	@Delete('/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Delete bank account by id',
		description: 'Deletes the bank account information.',
	})
	@ApiDeleteBankAccountResponses()
	async delete(@Param('id') id: string, @CurrentUser() user) {
		// Verify bank account ownership before deleting
		await this.bankAccountService.findOne(id, user.userId)
		return this.bankAccountService.delete(id)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id/balance-history')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get balance history',
		description: 'Get balance history on a 6 months period.',
	})
	async getBalanceHistory(@Param('id') id: string, @CurrentUser() user) {
		return this.bankAccountService.getBalanceHistory(id, user.userId)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id/recent-movements')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get recent movements',
		description: 'Get recent movements of an account.',
	})
	async getRecentMovements(@Param('id') id: string, @CurrentUser() user) {
		return this.bankAccountService.getRecentMovements(id, user.userId)
	}
}
