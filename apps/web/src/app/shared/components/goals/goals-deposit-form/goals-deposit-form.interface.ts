import type { Goal } from '@core/api/goals.interface'

export interface iDepositSheetData {
	id?: string
	goal?: Goal
	amount?: number
	date?: string
	note?: string
}
