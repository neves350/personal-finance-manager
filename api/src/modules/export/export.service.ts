import { Injectable } from '@nestjs/common'
import * as Papa from 'papaparse'
import { PrismaService } from 'src/infrastructure/db/prisma.service'
import { ExportTransactionsQueryDto } from './dtos/export-transactions-query.dto'
import { CsvTransformerHelper } from './helpers/csv-transformer.helper'
import { PdfGeneratorHelper } from './helpers/pdf-generator.helper'
import { TransactionQueryHelper } from './helpers/transaction-query.helper'

@Injectable()
export class ExportService {
	constructor(private readonly prisma: PrismaService) {}

	private async getExportTransactions(
		userId: string,
		query: ExportTransactionsQueryDto,
	) {
		const userAccounts = await this.prisma.bankAccount.findMany({
			where: { userId },
			select: { id: true },
		})

		if (userAccounts.length === 0) {
			return []
		}

		const accountIds = userAccounts.map((account) => account.id)

		const filters = TransactionQueryHelper.buildTransactionFilters(
			accountIds,
			query,
		)

		return this.prisma.transaction.findMany({
			where: filters,
			include: {
				category: {
					select: { title: true },
				},
				card: {
					select: { name: true },
				},
				bankAccount: {
					select: { name: true },
				},
			},
			orderBy: {
				date: 'desc',
			},
		})
	}

	async exportTransactionToCsv(
		userId: string,
		query: ExportTransactionsQueryDto,
	): Promise<string> {
		const transactions = await this.getExportTransactions(userId, query)

		const csvData =
			CsvTransformerHelper.transformTransactionsToCSV(transactions)

		return Papa.unparse(csvData, {
			header: true,
			delimiter: ',',
		})
	}

	async exportTransactionToPdf(
		userId: string,
		query: ExportTransactionsQueryDto,
	): Promise<Buffer> {
		const transactions = await this.getExportTransactions(userId, query)

		return PdfGeneratorHelper.generateTransactionsPdf(transactions, {
			startDate: query.startDate,
			endDate: query.endDate,
		})
	}
}
