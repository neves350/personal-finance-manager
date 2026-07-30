import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import {
	ArrowRightLeft,
	LucideAngularModule,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletIcon,
} from 'lucide-angular'
import { CATEGORY_ICON_MAP } from '@/shared/components/categories/category-icons'
import type { StatCard, Transaction } from './column-2.interface'

@Component({
	selector: 'app-column-2',
	imports: [LucideAngularModule],
	templateUrl: './column-2.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Column2 {
	readonly ArrowRightLeft = ArrowRightLeft

	protected readonly stats = signal<StatCard[]>([
		{
			id: 'income',
			label: 'Income',
			value: '+€1.85k',
			icon: TrendingUpIcon,
			badgeClass: 'bg-primary/20',
			iconClass: 'text-primary',
			valueClass: 'text-primary',
		},
		{
			id: 'expenses',
			label: 'Expenses',
			value: '−€1.17k',
			icon: TrendingDownIcon,
			badgeClass: 'bg-destructive/20',
			iconClass: 'text-destructive',
			valueClass: 'text-destructive',
		},
		{
			id: 'balance',
			label: 'Net Balance',
			value: '+€676',
			icon: WalletIcon,
			badgeClass: 'bg-chart-2/20',
			iconClass: 'text-chart-2',
			valueClass: 'text-primary',
		},
	])

	protected readonly transactions = signal<Transaction[]>([
		{
			id: 'ginasio',
			name: 'Ginásio',
			category: 'Healthcare',
			icon: CATEGORY_ICON_MAP['dumbbell'],
			type: 'Expense',
			dotClass: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
			typeClass: 'text-destructive',
			amount: '−€20.00',
			amountClass: 'text-destructive',
		},
		{
			id: 'mesada',
			name: 'Mesada',
			category: 'Gifts',
			icon: CATEGORY_ICON_MAP['gift'],
			type: 'Income',
			dotClass: 'bg-primary shadow-[0_0_6px_var(--color-primary)]',
			typeClass: 'text-primary',
			amount: '+€10.00',
			amountClass: 'text-primary',
		},
		{
			id: 'croquetes',
			name: 'Croquetes',
			category: 'Food & Dining',
			icon: CATEGORY_ICON_MAP['utensils'],
			type: 'Expense',
			dotClass: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
			typeClass: 'text-destructive',
			amount: '−€180.00',
			amountClass: 'text-destructive',
		},
		{
			id: 'claude-code',
			name: 'Claude Code',
			category: 'Subscriptions',
			icon: CATEGORY_ICON_MAP['repeat-2'],
			type: 'Expense',
			dotClass: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
			typeClass: 'text-destructive',
			amount: '−€21.00',
			amountClass: 'text-destructive',
		},
		{
			id: 'teste',
			name: 'Teste',
			category: 'Transportation',
			icon: CATEGORY_ICON_MAP['car'],
			type: 'Expense',
			dotClass: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
			typeClass: 'text-destructive',
			amount: '−€100.00',
			amountClass: 'text-destructive',
		},
		{
			id: 'dada',
			name: 'Dada',
			category: 'Housing',
			icon: CATEGORY_ICON_MAP['house'],
			type: 'Expense',
			dotClass: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
			typeClass: 'text-destructive',
			amount: '−€850.00',
			amountClass: 'text-destructive',
			dimmed: true,
		},
	])
}
