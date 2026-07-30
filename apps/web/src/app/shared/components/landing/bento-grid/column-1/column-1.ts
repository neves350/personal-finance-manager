import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import {
	ChartSplineIcon,
	CreditCardIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { CardGroup, Metric } from './column-1.interface'

@Component({
	selector: 'app-column-1',
	imports: [LucideAngularModule],
	templateUrl: './column-1.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Column1 {
	readonly CreditCardIcon = CreditCardIcon
	readonly ChartSplineIcon = ChartSplineIcon

	protected readonly cardGroups = signal<CardGroup[]>([
		{
			id: 'credit-cards',
			title: 'Credit Cards',
			total: '−€1,326.28',
			totalClass: 'text-[oklch(0.7_0.19_25)]',
			cards: [
				{
					id: 'card-2',
					badgeText: 'C2',
					badgeGradient: 'bg-[linear-gradient(135deg,#f0883e,#d9534f)]',
					name: 'Card 2',
					subtitle: 'Credit · Conta 1',
					amount: '€566.00',
					amountClass: 'text-[oklch(0.77_0.17_165)]',
					status: 'Available',
					statusClass:
						'bg-[oklch(0.77_0.17_165_/_.14)] text-[oklch(0.77_0.17_165)]',
				},
				{
					id: 'card-ending-1285',
					badgeText: 'C3',
					badgeGradient: 'bg-[linear-gradient(135deg,#e35d5b,#c0392b)]',
					name: '5325 •••• 1285',
					subtitle: 'Credit',
					amount: '−€2,023.28',
					amountClass: 'text-[oklch(0.7_0.19_25)]',
					status: 'Negative',
					statusClass:
						'bg-[oklch(0.7_0.19_25_/_.16)] text-[oklch(0.7_0.19_25)]',
				},
			],
		},
		{
			id: 'debit-cards',
			title: 'Debit Cards',
			total: '€4,585.30',
			totalClass: 'text-[oklch(0.77_0.17_165)]',
			cards: [
				{
					id: 'card-1',
					badgeText: 'C1',
					badgeGradient: 'bg-[linear-gradient(135deg,#f5c542,#e0a800)]',
					name: 'Card 1',
					subtitle: 'Debit · Banco 2',
					amount: '€131.00',
					amountClass: 'text-[oklch(0.77_0.17_165)]',
					status: 'Available',
					statusClass:
						'bg-[oklch(0.77_0.17_165_/_.14)] text-[oklch(0.77_0.17_165)]',
				},
			],
		},
	])

	protected readonly metrics = signal<Metric[]>([
		{
			id: 'total-balance',
			label: 'Total balance',
			value: '€24,180',
			valueClass: '',
		},
		{
			id: 'savings-rate',
			label: 'Savings rate',
			value: '62%',
			valueClass: 'text-[oklch(0.77_0.17_165)]',
		},
	])
}
