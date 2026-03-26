import {
	BadRequestException,
	Body,
	Controller,
	Headers,
	Logger,
	Post,
	RawBodyRequest,
	Req,
} from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import type { Request } from 'express'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { validateWebhookSignature } from './helpers/signature-validator'
import type { SaltEdgeWebhookPayload } from './interfaces/salt-edge.interface'
import { SaltEdgeService } from './salt-edge.service'

@ApiExcludeController()
@Controller('webhooks')
export class OpenBankingWebhookController {
	private readonly logger = new Logger(OpenBankingWebhookController.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly saltEdge: SaltEdgeService,
	) {}

	@Post('open-banking')
	async handleWebhook(
		@Headers('signature') signature: string,
		@Req() req: RawBodyRequest<Request>,
		@Body() payload: SaltEdgeWebhookPayload,
	) {
		// Validate webhook signature
		const rawBody = req.rawBody?.toString()
		if (rawBody && signature) {
			const isValid = validateWebhookSignature(signature, rawBody)
			if (!isValid) {
				this.logger.warn('Invalid webhook signature received')
				throw new BadRequestException('Invalid signature')
			}
		}

		const { stage } = payload.data
		const connectionId = payload.data.connection_id

		this.logger.log(
			`Webhook received: stage=${stage}, connection=${connectionId}`,
		)

		const saltEdgeCustomerId = payload.data.customer_id

		switch (stage) {
			case 'finish':
				await this.handleSuccess(connectionId, saltEdgeCustomerId)
				break
			case 'error':
				await this.handleError(connectionId)
				break
			default:
				this.logger.log(`Unhandled webhook stage: ${stage}`)
		}

		return { success: true }
	}

	private async handleSuccess(
		saltEdgeConnectionId: string,
		saltEdgeCustomerId: string,
	) {
		// Get connection details from Salt Edge
		const seConnection = await this.saltEdge.getConnection(saltEdgeConnectionId)

		// Find or create the local connection record
		let connection = await this.prisma.openBankingConnection.findUnique({
			where: { saltEdgeConnectionId },
		})

		if (!connection) {
			// Find our customer by Salt Edge customer ID from the webhook payload
			const customer = await this.prisma.openBankingCustomer.findUnique({
				where: { saltEdgeCustomerId },
			})

			if (!customer) {
				this.logger.error(
					`No customer found for Salt Edge customer ${saltEdgeCustomerId}`,
				)
				return
			}

			connection = await this.prisma.openBankingConnection.create({
				data: {
					customerId: customer.id,
					saltEdgeConnectionId,
					providerCode: seConnection.provider_code,
					providerName: seConnection.provider_name,
					status: 'ACTIVE',
					consentExpiresAt: seConnection.consent.expires_at
						? new Date(seConnection.consent.expires_at)
						: null,
					nextRefreshPossibleAt: seConnection.next_refresh_possible_at
						? new Date(seConnection.next_refresh_possible_at)
						: null,
					lastSyncAt: new Date(),
				},
			})

			this.logger.log(`Created connection for ${seConnection.provider_name}`)
		} else {
			// Update existing connection
			await this.prisma.openBankingConnection.update({
				where: { id: connection.id },
				data: {
					status: 'ACTIVE',
					lastSyncAt: new Date(),
					consentExpiresAt: seConnection.consent.expires_at
						? new Date(seConnection.consent.expires_at)
						: null,
					nextRefreshPossibleAt: seConnection.next_refresh_possible_at
						? new Date(seConnection.next_refresh_possible_at)
						: null,
				},
			})
		}

		// Sync accounts from Salt Edge
		await this.syncAccounts(connection)

		this.logger.log(
			`Successfully processed webhook for connection ${saltEdgeConnectionId}`,
		)
	}

	private async syncAccounts(connection: {
		id: string
		saltEdgeConnectionId: string
		customerId: string
	}) {
		const seAccounts = await this.saltEdge.getAccounts(
			connection.saltEdgeConnectionId,
		)

		// Find the user ID via the customer
		const customer = await this.prisma.openBankingCustomer.findUnique({
			where: { id: connection.customerId },
		})

		if (!customer) return

		for (const seAccount of seAccounts) {
			// Check if we already have this account linked
			const existingLink = await this.prisma.openBankingAccount.findUnique({
				where: { saltEdgeAccountId: seAccount.id },
			})

			if (existingLink) {
				// Update balance on existing bank account
				await this.prisma.bankAccount.update({
					where: { id: existingLink.bankAccountId },
					data: { balance: seAccount.balance },
				})
				await this.prisma.openBankingAccount.update({
					where: { id: existingLink.id },
					data: { lastSyncAt: new Date() },
				})
			} else {
				// Create new bank account + link
				const bankAccount = await this.prisma.bankAccount.create({
					data: {
						userId: customer.userId,
						name: seAccount.name,
						type: this.mapAccountNature(seAccount.nature),
						balance: seAccount.balance,
						initialBalance: seAccount.balance,
						isLinked: true,
					},
				})

				await this.prisma.openBankingAccount.create({
					data: {
						connectionId: connection.id,
						bankAccountId: bankAccount.id,
						saltEdgeAccountId: seAccount.id,
						iban: seAccount.iban,
						currencyCode: seAccount.currency_code,
						nature: seAccount.nature,
						lastSyncAt: new Date(),
					},
				})

				this.logger.log(
					`Linked new account: ${seAccount.name} (${seAccount.nature})`,
				)
			}
		}
	}

	private async handleError(saltEdgeConnectionId: string) {
		await this.prisma.openBankingConnection.updateMany({
			where: { saltEdgeConnectionId },
			data: { status: 'INACTIVE' },
		})

		this.logger.warn(
			`Connection ${saltEdgeConnectionId} marked as INACTIVE due to error`,
		)
	}

	private mapAccountNature(
		nature: string,
	): 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'WALLET' {
		switch (nature) {
			case 'savings':
				return 'SAVINGS'
			case 'investment':
				return 'INVESTMENT'
			case 'bonus':
			case 'card':
			case 'checking':
			case 'account':
			default:
				return 'CHECKING'
		}
	}
}
