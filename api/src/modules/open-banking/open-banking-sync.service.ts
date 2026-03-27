import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { mapSaltEdgeCategory } from './helpers/category-mapper'
import type { SaltEdgeAccount } from './interfaces/salt-edge.interface'
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
				// Update balance on the linked BankAccount stub or regular account
				await this.prisma.bankAccount.update({
					where: { id: existingLink.bankAccountId },
					data: { balance: seAccount.balance },
				})
				await this.prisma.openBankingAccount.update({
					where: { id: existingLink.id },
					data: { lastSyncAt: new Date() },
				})
			} else if (this.isCardAccount(seAccount.nature, seAccount.name)) {
				await this.createCardAccount(connectionId, userId, seAccount)
			} else {
				await this.createRegularAccount(connectionId, userId, seAccount)
			}
		}
	}

	private async createCardAccount(
		connectionId: string,
		userId: string,
		seAccount: SaltEdgeAccount,
	) {
		// Try to reuse a disconnected card stub
		const disconnected = await this.prisma.bankAccount.findFirst({
			where: {
				userId,
				isLinked: true,
				isCardAccount: true,
				name: seAccount.name,
				openBankingAccount: null,
			},
		})

		let stubId: string

		if (disconnected) {
			await this.prisma.bankAccount.update({
				where: { id: disconnected.id },
				data: { balance: seAccount.balance },
			})
			stubId = disconnected.id
			this.logger.log(`Re-linked disconnected card: ${seAccount.name}`)
		} else {
			const stub = await this.prisma.bankAccount.create({
				data: {
					userId,
					name: seAccount.name,
					type: 'CHECKING',
					balance: seAccount.balance,
					initialBalance: seAccount.balance,
					isLinked: true,
					isCardAccount: true,
				},
			})
			await this.prisma.card.create({
				data: {
					userId,
					bankAccountId: stub.id,
					name: seAccount.name,
					type: this.detectCardType(seAccount.nature, seAccount.extra),
					lastFour: this.extractLastFour(seAccount.name, seAccount.iban),
					expirationDate: this.extractExpiryDate(seAccount.extra),
					creditLimit: seAccount.extra.credit_limit ?? undefined,
					isLinked: true,
					color: 'GRAY',
				},
			})
			stubId = stub.id
			this.logger.log(`Linked new card: ${seAccount.name} (${seAccount.nature})`)
		}

		await this.prisma.openBankingAccount.create({
			data: {
				connectionId,
				bankAccountId: stubId,
				saltEdgeAccountId: seAccount.id,
				iban: seAccount.iban,
				currencyCode: seAccount.currency_code,
				nature: seAccount.nature,
				lastSyncAt: new Date(),
			},
		})
	}

	private async createRegularAccount(
		connectionId: string,
		userId: string,
		seAccount: SaltEdgeAccount,
	) {
		// Try to reuse a disconnected regular account
		const disconnected = await this.prisma.bankAccount.findFirst({
			where: {
				userId,
				isLinked: true,
				isCardAccount: false,
				name: seAccount.name,
				openBankingAccount: null,
			},
		})

		let accountId: string

		if (disconnected) {
			await this.prisma.bankAccount.update({
				where: { id: disconnected.id },
				data: {
					balance: seAccount.balance,
					type: this.mapAccountNature(seAccount.nature),
				},
			})
			accountId = disconnected.id
			this.logger.log(`Re-linked disconnected account: ${seAccount.name}`)
		} else {
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
			accountId = bankAccount.id
			this.logger.log(`Linked new account: ${seAccount.name} (${seAccount.nature})`)
		}

		await this.prisma.openBankingAccount.create({
			data: {
				connectionId,
				bankAccountId: accountId,
				saltEdgeAccountId: seAccount.id,
				iban: seAccount.iban,
				currencyCode: seAccount.currency_code,
				nature: seAccount.nature,
				lastSyncAt: new Date(),
			},
		})
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

				const txDate = new Date(seTx.made_on)
				const txAmount = Math.abs(seTx.amount)
				const txTitle = seTx.description || 'Bank transaction'

				const recurringId = await this.findMatchingRecurring(
					userId,
					txTitle,
					txAmount,
					type,
					txDate,
				)

				await this.prisma.transaction.create({
					data: {
						bankAccountId: obAccount.bankAccountId,
						categoryId: category.id,
						title: txTitle,
						type,
						amount: txAmount,
						date: txDate,
						isPaid: true,
						source: 'OPEN_BANKING',
						externalId: seTx.id,
						recurringId: recurringId ?? undefined,
					},
				})
        synced++

        this.logger.log(`Tx: ${seTx.description} | category: ${seTx.category} | amount: ${seTx.amount} | extra: ${JSON.stringify(seTx.extra)}`)
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

  private isCardAccount(nature: string, name: string): boolean {
    if (nature === 'card' || nature === 'credit_card') return true
    // fallback by nome
    return /\d{4}\s*\*+\s*\*+\s*\d{4}/.test(name) ||
      /(mastercard|visa|maestro|amex)/i.test(name)
  }

  private detectCardType(nature: string, extra: Record<string, unknown>): 'CREDIT_CARD' | 'DEBIT_CARD' {
    if (nature === 'credit_card') return 'CREDIT_CARD'
    const network = extra?.card_network as string | undefined
    if (network && /(credit|mastercard|visa|amex)/i.test(network)) return 'CREDIT_CARD'
    return 'DEBIT_CARD'
  }

  private extractLastFour(name: string, iban: string | null): string | null {
    const match = name.match(/(\d{4})\s*$/)
    if (match) return match[1]
    return iban?.slice(-4) ?? null
  }

  private extractExpiryDate(extra: Record<string, unknown>): string | null {
    const expiryDate = extra?.expiry_date as string | undefined
    if (!expiryDate) return null
    const [year, month] = expiryDate.split('-')  // "2028-03-01"
    return `${month}/${year.slice(2)}`           // "03/28"
  }

	private normalizeDescription(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	}

	private async findMatchingRecurring(
		userId: string,
		description: string,
		amount: number,
		type: 'INCOME' | 'EXPENSE',
		date: Date,
	): Promise<string | null> {
		const dayOfMonth = date.getDate()
		const normalizedTxDesc = this.normalizeDescription(description)
		const margin = amount * 0.05

		const candidates = await this.prisma.recurring.findMany({
			where: {
				bankAccount: { userId },
				type,
				amount: {
					gte: amount - margin,
					lte: amount + margin,
				},
				OR: [
					{ monthDay: null },
					{ monthDay: dayOfMonth },
				],
			},
		})

		for (const recurring of candidates) {
			const normalizedRecurringDesc = this.normalizeDescription(
				recurring.description,
			)
			if (
				normalizedTxDesc.includes(normalizedRecurringDesc) ||
				normalizedRecurringDesc.includes(normalizedTxDesc)
			) {
				return recurring.id
			}
		}

		return null
	}

}
