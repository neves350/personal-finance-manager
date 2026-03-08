import type { TransactionType } from './transactions.interface'

export interface ExportsQueryParams {
	cardId?: string
	accountId?: string
	categoryId?: string
	type?: TransactionType
	startDate?: string
	endDate?: string
}
