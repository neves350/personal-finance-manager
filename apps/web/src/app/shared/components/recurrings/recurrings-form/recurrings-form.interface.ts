import type {
	FrequencyType,
	PaymentMethodType,
	RecurringType,
} from '@core/api/recurrings.interface'

export interface iRecurringSheetData {
	id?: string
	cardId?: string
	bankAccountId?: string
	categoryId?: string
	type?: RecurringType
	description?: string
	amount?: number
	monthDay?: number | string
	frequency?: FrequencyType
	paymentMethod?: PaymentMethodType
	startDate?: string
	endDate?: string
}
