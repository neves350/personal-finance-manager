import {
	BadGatewayException,
	BadRequestException,
	Injectable,
	Logger,
} from '@nestjs/common'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { CreateConnectSessionDto } from './dtos/create-connect-session.dto'
import { DisconnectBankDto } from './dtos/disconnect-bank.dto'
import { FindConnectionService } from './helpers/find-connection.helper'
import { SaltEdgeService } from './salt-edge.service'

@Injectable()
export class OpenBankingService {
	private readonly logger = new Logger(OpenBankingService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly saltEdge: SaltEdgeService,
		private readonly findConnectionService: FindConnectionService,
	) {}

	// Customer Management
	async getOrCreateCustomer(userId: string) {
		const existing = await this.prisma.openBankingCustomer.findUnique({
			where: { userId },
		})

		if (existing) return existing

		let saltEdgeCustomerId: string

		try {
			const created = await this.saltEdge.createCustomer(userId)
			saltEdgeCustomerId = created.customer_id
		} catch (error) {
			// Customer already exists in Salt Edge but not in our DB — recover it
			if (
				error instanceof BadGatewayException &&
				error.message.includes('DuplicatedCustomer')
			) {
				const recovered = await this.saltEdge.getCustomerByIdentifier(userId)
				if (!recovered) throw error
				saltEdgeCustomerId = recovered.customer_id
				this.logger.warn(
					`Recovered existing Salt Edge customer for user ${userId}`,
				)
			} else {
				throw error
			}
		}

		const customer = await this.prisma.openBankingCustomer.create({
			data: { userId, saltEdgeCustomerId },
		})

		this.logger.log(`Created OpenBanking customer for user ${userId}`)
		return customer
	}

	// Connect Session
	async createConnectSession(userId: string, dto: CreateConnectSessionDto) {
		const customer = await this.getOrCreateCustomer(userId)

		const ninetyDaysAgo = new Date()
		ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
		const fromDate = ninetyDaysAgo.toISOString().split('T')[0]

		const session = await this.saltEdge.createConnectSession({
			customerId: customer.saltEdgeCustomerId,
			consentScopes: ['accounts', 'transactions'],
			consentFromDate: fromDate,
			returnTo: dto.returnTo,
			providerCode: dto.providerCode,
		})

		return { connectUrl: session.connect_url }
	}

	// Handle Callback — discover new connections from Salt Edge
	async handleCallback(userId: string) {
		const customer = await this.prisma.openBankingCustomer.findUnique({
			where: { userId },
		})

		if (!customer) return { discovered: 0 }

		const seConnections = await this.saltEdge.listConnections(
			customer.saltEdgeCustomerId,
		)

		let discovered = 0

		for (const seConn of seConnections) {
			const exists = await this.prisma.openBankingConnection.findUnique({
				where: { saltEdgeConnectionId: seConn.id },
			})

			if (!exists) {
				const provider = await this.saltEdge.getProvider(seConn.provider_code)

				await this.prisma.openBankingConnection.create({
					data: {
						customerId: customer.id,
						saltEdgeConnectionId: seConn.id,
						providerCode: seConn.provider_code,
						providerName: seConn.provider_name,
						providerLogoUrl: provider?.logo_url ?? null,
						status: seConn.status === 'active' ? 'ACTIVE' : 'INACTIVE',
						consentExpiresAt: seConn.consent?.expires_at
							? new Date(seConn.consent.expires_at)
							: null,
						nextRefreshPossibleAt: seConn.next_refresh_possible_at
							? new Date(seConn.next_refresh_possible_at)
							: null,
						lastSyncAt: seConn.last_success_at
							? new Date(seConn.last_success_at)
							: null,
					},
				})
				discovered++
				this.logger.log(
					`Discovered new connection: ${seConn.provider_name} (${seConn.id})`,
				)
			}
		}

		return { discovered }
	}

	// List Connections
	async listConnections(userId: string) {
		const customer = await this.prisma.openBankingCustomer.findUnique({
			where: { userId },
		})

		if (!customer) return { data: [] }

		const connections = await this.prisma.openBankingConnection.findMany({
			where: { customerId: customer.id },
			include: {
				accounts: {
					include: {
						bankAccount: {
							select: { id: true, name: true, balance: true },
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return { data: connections }
	}

	// Connection Details
	async getConnectionDetails(connectionId: string, userId: string) {
		return this.findConnectionService.findConnectionByUser(connectionId, userId)
	}

	// Refresh Connection
	async refreshConnection(connectionId: string, userId: string) {
		const connection = await this.findConnectionService.findConnectionByUser(
			connectionId,
			userId,
		)

		// Check PSD2 rate limit (4 per 24h)
		if (
			connection.nextRefreshPossibleAt &&
			new Date() < connection.nextRefreshPossibleAt
		) {
			throw new BadRequestException(
				'Refresh not available yet. PSD2 limits refreshes to 4 per 24 hours.',
			)
		}

		const refreshed = await this.saltEdge.refreshConnection(
			connection.saltEdgeConnectionId,
		)

		await this.prisma.openBankingConnection.update({
			where: { id: connection.id },
			data: {
				nextRefreshPossibleAt: refreshed.next_refresh_possible_at
					? new Date(refreshed.next_refresh_possible_at)
					: null,
			},
		})

		return { message: 'Connection refresh started' }
	}

	// Disconnect Bank
	async disconnectBank(
		connectionId: string,
		userId: string,
		dto: DisconnectBankDto,
	) {
		const connection = await this.findConnectionService.findConnectionByUser(
			connectionId,
			userId,
		)

		// Remove connection from Salt Edge
		await this.saltEdge.removeConnection(connection.saltEdgeConnectionId)

		if (dto.keepData) {
			// Keep accounts/transactions — isLinked stays true as a permanent marker.
			// Deleting the connection cascades to delete OpenBankingAccount links.
			// Frontend derives state: isLinked + no connection = "Disconnected".
			await this.prisma.openBankingConnection.delete({
				where: { id: connection.id },
			})
		} else {
			// Delete everything: connection + linked accounts + their transactions
			const linkedAccounts = await this.prisma.openBankingAccount.findMany({
				where: { connectionId: connection.id },
				select: { bankAccountId: true },
			})

			const bankAccountIds = linkedAccounts.map((a) => a.bankAccountId)

			await this.prisma.$transaction([
				this.prisma.transaction.deleteMany({
					where: {
						bankAccountId: { in: bankAccountIds },
						source: 'OPEN_BANKING',
					},
				}),
				this.prisma.bankAccount.deleteMany({
					where: { id: { in: bankAccountIds } },
				}),
				this.prisma.openBankingConnection.delete({
					where: { id: connection.id },
				}),
			])
		}

		this.logger.log(
			`Disconnected bank ${connection.providerName} for user ${userId}`,
		)
		return { message: 'Bank disconnected successfully' }
	}

	// Providers
	async getProviders() {
		const providers = await this.saltEdge.getProviders()

		return {
			data: providers.map((p) => ({
				code: p.code,
				name: p.name,
				countryCode: p.country_code,
				logoUrl: p.logo_url,
				status: p.status,
			})),
		}
	}
}
