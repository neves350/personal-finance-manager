import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
	ChartPie,
	CreditCard,
	Goal,
	LayoutGrid,
	LucideAngularModule,
} from 'lucide-angular'

@Component({
	selector: 'app-features',
	imports: [LucideAngularModule],
	templateUrl: './features.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Features {
	readonly LayoutGrid = LayoutGrid
	readonly CreditCard = CreditCard
	readonly ChartPie = ChartPie
	readonly Goal = Goal
}
