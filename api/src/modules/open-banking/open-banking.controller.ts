import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateConnectSessionDto } from './dtos/create-connect-session.dto'
import { DisconnectBankDto } from './dtos/disconnect-bank.dto'
import { OpenBankingSyncService } from './open-banking-sync.service'
import { OpenBankingService } from './open-banking.service'

@ApiTags('Open Banking')
@Controller('open-banking')
export class OpenBankingController {
	constructor(
		private readonly openBankingService: OpenBankingService,
		private readonly syncService: OpenBankingSyncService,
	) {}

	@UseGuards(JwtAuthGuard)
	@Post('connect')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create a bank connect session',
		description:
			'Creates a Salt Edge connect session and returns a URL to redirect the user.',
	})
	async createConnectSession(
		@Body() dto: CreateConnectSessionDto,
		@CurrentUser() user,
	) {
		return this.openBankingService.createConnectSession(user.userId, dto)
	}

	@UseGuards(JwtAuthGuard)
	@Post('handle-callback')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Handle Salt Edge callback',
		description:
			'Discovers new connections after Salt Edge redirect and triggers initial sync.',
	})
	async handleCallback(@CurrentUser() user) {
		const result = await this.openBankingService.handleCallback(user.userId)

		// If new connections discovered, sync them
		if (result.discovered > 0) {
			const connections =
				await this.openBankingService.listConnections(user.userId)
			for (const conn of connections.data) {
				try {
					await this.syncService.fullSync(conn.id, user.userId)
				} catch (error) {
					// Log but don't fail — connection is still saved
				}
			}
		}

		return result
	}

	@UseGuards(JwtAuthGuard)
	@Get('connections')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'List all bank connections',
		description: 'Returns all Open Banking connections for the user.',
	})
	async listConnections(@CurrentUser() user) {
		return this.openBankingService.listConnections(user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Get('connections/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get connection details',
		description:
			'Returns details of a specific connection with linked accounts.',
	})
	async getConnectionDetails(@Param('id') id: string, @CurrentUser() user) {
		return this.openBankingService.getConnectionDetails(id, user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Post('connections/:id/refresh')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Refresh a bank connection',
		description:
			'Triggers a data refresh from the bank. Limited to 4 per 24h (PSD2).',
	})
	async refreshConnection(@Param('id') id: string, @CurrentUser() user) {
		return this.openBankingService.refreshConnection(id, user.userId)
	}

	@UseGuards(JwtAuthGuard)
	@Delete('connections/:id')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Disconnect a bank',
		description:
			'Disconnects the bank and optionally keeps or deletes synced data.',
	})
	async disconnectBank(
		@Param('id') id: string,
		@Body() dto: DisconnectBankDto,
		@CurrentUser() user,
	) {
		return this.openBankingService.disconnectBank(id, user.userId, dto)
	}

	@UseGuards(JwtAuthGuard)
	@Post('connections/:id/sync')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Sync a bank connection',
		description:
			'Triggers a manual sync of accounts and transactions for this connection.',
	})
	async syncConnection(@Param('id') id: string, @CurrentUser() user) {
		await this.openBankingService.getConnectionDetails(id, user.userId)
		await this.syncService.fullSync(id, user.userId)
		return { message: 'Sync completed successfully' }
	}

	@UseGuards(JwtAuthGuard)
	@Get('providers')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'List available bank providers',
		description: 'Returns available Portuguese bank providers for connection.',
	})
	async getProviders() {
		return this.openBankingService.getProviders()
	}
}
