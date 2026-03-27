import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { mapSaltEdgeCategory } from './helpers/category-mapper'
import { SaltEdgeService } from './salt-edge.service'

@Injectable()
export class OpenBankingSyncService {
	private readonly logger = new Logger(OpenBankingSyncService.name)

	constructor(
		private readonly prisma: PrismaService,
		private readonly saltEdge: SaltEdgeService,
	) {}

	// Cron: Sync every 6 hours
	@Cron(CronExpression.EVERY_6_HOURS)
	async scheduledSync() {
		this.logger.log('Starting scheduled Open Banking sync...')

		const activeConnections = await this.prisma.openBankingConnection.findMany({
			where: { status: 'ACTIVE' },
			include: {
				customer: true,
				accounts: true,
			},
		})

		for (const connection of activeConnections) {
			try {
				await this.fullSync(connection.id, connection.customer.userId)
			} catch (error) {
				this.logger.error(
					`Sync failed for connection ${connection.id}: ${error.message}`,
				)
			}
		}

		this.logger.log(
			`Scheduled sync completed for ${activeConnections.length} connections`,
		)
	}

	// Full Sync
	async fullSync(connectionId: string, userId: string) {
		await this.syncAccounts(connectionId, userId)
		await this.syncTransactions(connectionId, userId)

		await this.prisma.openBankingConnection.update({
			where: { id: connectionId },
			data: { lastSyncAt: new Date() },
		})
	}

	// Sync Accounts
	async syncAccounts(connectionId: string, userId: string) {
		const connection = await this.prisma.openBankingConnection.findUnique({
			where: { id: connectionId },
			include: { accounts: true },
		})

		if (!connection) return

		const seAccounts = await this.saltEdge.getAccounts(
			connection.saltEdgeConnectionId,
		)

		for (const seAccount of seAccounts) {
			const existingLink = await this.prisma.openBankingAccount.findUnique({
				where: { saltEdgeAccountId: seAccount.id },
			})

			if (existingLink) {
				// Update balance
				await this.prisma.bankAccount.update({
					where: { id: existingLink.bankAccountId },
					data: { balance: seAccount.balance },
				})
				await this.prisma.openBankingAccount.update({
					where: { id: existingLink.id },
					data: { lastSyncAt: new Date() },
				})
			} else {
				// Try to reuse a disconnected account (isLinked but no OpenBankingAccount link)
				const disconnected = await this.prisma.bankAccount.findFirst({
					where: {
						userId,
						isLinked: true,
						name: seAccount.name,
						openBankingAccount: null,
					},
				})

				if (disconnected) {
					// Reuse the disconnected account — update balance and re-link
					await this.prisma.bankAccount.update({
						where: { id: disconnected.id },
						data: {
							balance: seAccount.balance,
							type: this.mapAccountNature(seAccount.nature),
						},
					})

					await this.prisma.openBankingAccount.create({
						data: {
							connectionId,
							bankAccountId: disconnected.id,
							saltEdgeAccountId: seAccount.id,
							iban: seAccount.iban,
							currencyCode: seAccount.currency_code,
							nature: seAccount.nature,
							lastSyncAt: new Date(),
						},
					})

					this.logger.log(
						`Re-linked disconnected account: ${seAccount.name}`,
					)
				} else {
					// Create new bank account + link
					const bankAccount = await this.prisma.bankAccount.create({
						data: {
							userId,
							name: seAccount.name,
							type: this.mapAccountNature(seAccount.nature),
							balance: seAccount.balance,
							initialBalance: seAccount.balance,
							isLinked: true,
						},
					})

					await this.prisma.openBankingAccount.create({
						data: {
							connectionId,
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
	}

	// Sync Transactions
	async syncTransactions(connectionId: string, userId: string) {
		const connection = await this.prisma.openBankingConnection.findUnique({
			where: { id: connectionId },
			include: { accounts: true },
		})

		if (!connection) return

		// Calculate from_date: last sync or 90 days ago
		const fromDate = connection.lastSyncAt
			? connection.lastSyncAt.toISOString().split('T')[0]
			: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
					.toISOString()
					.split('T')[0]

		for (const obAccount of connection.accounts) {
			const seTransactions = await this.saltEdge.getTransactions({
				connectionId: connection.saltEdgeConnectionId,
				accountId: obAccount.saltEdgeAccountId,
				fromDate,
			})

			let synced = 0
			for (const seTx of seTransactions) {
				// Skip duplicated or pending transactions
				if (seTx.duplicated || seTx.status === 'pending') continue

				// Deduplicate via externalId
				const exists = await this.prisma.transaction.findUnique({
					where: { externalId: seTx.id },
				})
				if (exists) continue

				// Determine type: positive = INCOME, negative = EXPENSE
				const isIncome = seTx.amount > 0
				const type = isIncome ? 'INCOME' : 'EXPENSE'

				// Find matching category for the user
				const categoryTitle = mapSaltEdgeCategory(seTx.category, isIncome)
				const category = await this.findUserCategory(
					userId,
					categoryTitle,
					type,
				)

				if (!category) {
					this.logger.warn(
						`No category found for "${categoryTitle}" (${type}), skipping transaction ${seTx.id}`,
					)
					continue
				}

				await this.prisma.transaction.create({
					data: {
						bankAccountId: obAccount.bankAccountId,
						categoryId: category.id,
						title: seTx.description || 'Bank transaction',
						type,
						amount: Math.abs(seTx.amount),
						date: new Date(seTx.made_on),
						isPaid: true,
						source: 'OPEN_BANKING',
						externalId: seTx.id,
					},
				})
				synced++
			}

			if (synced > 0) {
				this.logger.log(
					`Synced ${synced} transactions for account ${obAccount.bankAccountId}`,
				)
			}
		}
	}

	// Helpers
	private async findUserCategory(
		userId: string,
		title: string,
		type: 'INCOME' | 'EXPENSE',
	) {
		// Try user's own categories first, then default categories
		return this.prisma.category.findFirst({
			where: {
				title,
				type,
				OR: [{ userId }, { isDefault: true }],
			},
		})
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
