interface CardRow {
	id: string
	badgeText: string
	badgeGradient: string
	name: string
	subtitle: string
	amount: string
	amountClass: string
	status: string
	statusClass: string
}

export interface CardGroup {
	id: string
	title: string
	total: string
	totalClass: string
	cards: CardRow[]
}

export interface Metric {
	id: string
	label: string
	value: string
	valueClass: string
}
