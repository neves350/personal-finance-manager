import { CardColor, CardType } from '@core/api/cards.interface'

export interface iSheetData {
	id?: string
	name?: string
	color?: CardColor
	type?: CardType
	lastFour?: string
	creditLimit?: number
	expirationDate?: string
	cvc?: string
	closingDay?: number | string
	dueDay?: number | string
	accountId?: string
}
