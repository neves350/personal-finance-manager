import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common'
import {
	afterNextRender,
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { Card, CardTransaction } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import {
	ArrowRightIcon,
	ArrowRightLeftIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { CATEGORY_ICON_MAP } from '../../../categories/category-icons'

@Component({
	selector: 'app-card-recent',
	imports: [
		ZardCardComponent,
		ZardButtonComponent,
		LucideAngularModule,
		CurrencyPipe,
		DatePipe,
		TitleCasePipe,
		RouterLink,
	],
	templateUrl: './card-recent.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRecent {
	readonly card = input.required<Card>()
	readonly ArrowRightIcon = ArrowRightIcon
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly iconMap = CATEGORY_ICON_MAP

	private readonly cardsService = inject(CardsService)

	readonly transactions = signal<CardTransaction[]>([])
	readonly loading = signal(true)
	readonly hasTransactions = computed(() => this.transactions().length > 0)

	constructor() {
		afterNextRender(() => this.fetchTransactions())
	}

	private fetchTransactions() {
		this.cardsService.recentTransactions(this.card().id!).subscribe({
			next: (data) => {
				this.transactions.set(data)
				this.loading.set(false)
			},
		})
	}

	getAmountPrefix(tx: CardTransaction): string {
		return tx.type === 'INCOME' ? '+' : '-'
	}

	getAmountColorClass(tx: CardTransaction): string {
		return tx.type === 'INCOME' ? 'text-primary' : 'text-destructive'
	}
}
