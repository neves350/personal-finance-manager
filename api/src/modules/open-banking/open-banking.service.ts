import { BadRequestException, Injectable, Logger } from '@nestjs/common'
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

		const saltEdgeCustomer = await this.saltEdge.createCustomer(userId)

		const customer = await this.prisma.openBankingCustomer.create({
			data: {
				userId,
				saltEdgeCustomerId: saltEdgeCustomer.id,
			},
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
			consentScopes: ['account_details', 'transactions_details'],
			consentFromDate: fromDate,
			returnTo: dto.returnTo,
			providerCode: dto.providerCode,
		})

		return { connectUrl: session.connect_url }
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
			// Keep accounts/transactions but mark as disconnected
			await this.prisma.$transaction([
				this.prisma.bankAccount.updateMany({
					where: {
						openBankingAccount: {
							connectionId: connection.id,
						},
					},
					data: { isLinked: false },
				}),
				this.prisma.openBankingConnection.delete({
					where: { id: connection.id },
				}),
			])
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
