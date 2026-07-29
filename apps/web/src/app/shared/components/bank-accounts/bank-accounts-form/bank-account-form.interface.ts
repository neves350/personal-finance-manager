import type { BankType } from '@core/api/bank-accounts.interface'

export interface iSheetData {
	id?: string
	name?: string
	type?: BankType
	balance?: number
	createdAt?: string
}
