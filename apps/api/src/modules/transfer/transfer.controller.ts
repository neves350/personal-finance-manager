import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import {
	ApiCreateTransferResponses,
	ApiFindAllTransfersResponses,
	ApiFindOneTransferResponses,
} from 'src/common/decorators/api-responses/transfer-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { QueryTransferDto } from './dtos/query-transfer.dto'
import { TransferDto } from './dtos/transfer.dto'
import { TransferService } from './transfer.service'

@ApiTags('Transfers')
@Controller('transfer')
export class TransferController {
	constructor(private readonly transferService: TransferService) {}

	@UseGuards(JwtAuthGuard)
	@Post('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a new transfer',
		description:
			'Creates a new transfer for an account with amount, fromAccountId, toAccountId, date & description (optional).',
	})
	@ApiCreateTransferResponses()
	async transfer(@Body() data: TransferDto, @CurrentUser() user) {
		return this.transferService.transfer(user.userId, data)
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get('')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Find all transfers',
		description: 'Find all transfers for an account.',
	})
	@ApiFindAllTransfersResponses()
	async findAll(@CurrentUser() user, @Query() query: QueryTransferDto) {
		const transfers = await this.transferService.findAll(user.userId, query)

		return transfers
	}

	@Throttle({ lenient: {} })
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Find one transfer',
		description: 'Find one transfers for an account.',
	})
	@ApiFindOneTransferResponses()
	async findOne(@Param('id') id: string, @CurrentUser() user) {
		const transfer = await this.transferService.findOne(id, user.userId)

		return { transfer }
	}
}
