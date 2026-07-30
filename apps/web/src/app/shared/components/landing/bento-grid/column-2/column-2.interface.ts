import type { LucideIconData } from 'lucide-angular'

export interface Transaction {
	id: string
	name: string
	category: string
	icon: LucideIconData
	type: string
	dotClass: string
	typeClass: string
	amount: string
	amountClass: string
	dimmed?: boolean
}

export interface StatCard {
	id: string
	label: string
	value: string
	icon: LucideIconData
	badgeClass: string
	iconClass: string
	valueClass: string
}
