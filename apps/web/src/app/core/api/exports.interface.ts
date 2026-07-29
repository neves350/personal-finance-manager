import type { TransactionType } from './transactions.interface'

export interface ExportsQueryParams {
	accountId?: string
	categoryId?: string
	type?: TransactionType
	startDate?: string
	endDate?: string
}
