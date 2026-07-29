export type MovementType = 'transfer' | 'income' | 'expense'

export interface Movement {
	id: string
	type: MovementType
	label: string
	subtitle: string
	amount: number
	date: Date
}
