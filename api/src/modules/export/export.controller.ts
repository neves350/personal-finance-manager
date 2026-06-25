import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import {
	ApiExportCsvResponses,
	ApiExportPdfResponses,
} from 'src/common/decorators/api-responses/export-responses.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ExportTransactionsQueryDto } from './dtos/export-transactions-query.dto'
import { ExportService } from './export.service'

@ApiTags('Exports')
@Controller('export')
export class ExportController {
	constructor(readonly exportService: ExportService) {}

	@UseGuards(JwtAuthGuard)
	@Get('transactions/csv')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Export transactions to CSV',
		description:
			'Downloads all transactions as CSV file. Supports filtering by card, date range, and transaction type.',
	})
	@ApiExportCsvResponses()
	async exportTransactionsCsv(
		@CurrentUser() user,
		@Query() query: ExportTransactionsQueryDto,
		@Res() res: Response,
	) {
		// generate csv
		const csv = await this.exportService.exportTransactionToCsv(
			user.userId,
			query,
		)

		// configurate headers for download
		const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`

		res.setHeader('Content-Type', 'text/csv')
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

		// send csv
		res.send(csv)
	}

	@UseGuards(JwtAuthGuard)
	@Get('transactions/pdf')
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Export transactions to PDF',
		description:
			'Downloads all transactions as PDF report. Supports filtering by account, category, date range, and transaction type.',
	})
	@ApiExportPdfResponses()
	async exportTransactionsPdf(
		@CurrentUser() user,
		@Query() query: ExportTransactionsQueryDto,
		@Res() res: Response,
	) {
		const pdf = await this.exportService.exportTransactionToPdf(
			user.userId,
			query,
		)

		const filename = `transactions_${new Date().toISOString().split('T')[0]}.pdf`

		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

		res.send(pdf)
	}
}
