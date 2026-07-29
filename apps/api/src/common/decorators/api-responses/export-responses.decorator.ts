import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

/**
 * Export Transaction Csv
 */
export function ApiExportCsvResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'CSV file downloaded successfully',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}

/**
 * Export Transaction Pdf
 */
export function ApiExportPdfResponses() {
	return applyDecorators(
		ApiResponse({
			status: 200,
			description: 'PDF file downloaded successfully',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized',
		}),
	)
}
