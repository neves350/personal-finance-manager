import type { TransferStatus } from '@core/api/transfers.interface'

export interface iSheetData {
	id?: string
	amount?: number
	fromAccountId?: string
	toAccountId?: string
	date?: Date
	description?: string
	status?: TransferStatus
	executedAt?: Date
	createdAt?: string
}
