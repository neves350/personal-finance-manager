import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { Card, CardColor, CardType } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import {
	BanknoteIcon,
	CreditCardIcon,
	EllipsisIcon,
	EyeIcon,
	LucideAngularModule,
	LucideIconData,
	SquarePenIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardPopoverComponent, ZardPopoverDirective } from '../../ui/popover'
import { ZardSheetService } from '../../ui/sheet'
import { CardsForm } from '../cards-form/cards-form'
import type { iSheetData } from '../cards-form/cards-form.interface'

@Component({
	selector: 'app-cards-card',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardButtonComponent,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardDividerComponent,
		RouterLink,
		CurrencyPipe,
	],
	templateUrl: './cards-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsCard {
	readonly card = input.required<Card>()

	private readonly cardsService = inject(CardsService)
	private readonly dialogService = inject(ZardDialogService)
	private readonly sheetService = inject(ZardSheetService)

	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly EyeIcon = EyeIcon
	readonly EllipsisIcon = EllipsisIcon

	readonly isCreditCard = computed(
		() => this.card().type === CardType.CREDIT_CARD,
	)

	private readonly textColorClasses: Record<CardColor, string> = {
		[CardColor.GRAY]: 'text-zinc-500 bg-zinc-500/20',
		[CardColor.PURPLE]: 'text-chart-3 bg-chart-3/20',
		[CardColor.BLUE]: 'text-chart-2 bg-chart-2/20',
		[CardColor.GREEN]: 'text-primary bg-primary/20',
		[CardColor.YELLOW]: 'text-amber-300 bg-amber-300/20',
		[CardColor.ORANGE]: 'text-chart-4 bg-chart-4/20',
		[CardColor.RED]: 'text-chart-5 bg-chart-5/20',
		[CardColor.PINK]: 'text-chart-6 bg-chart-6/20',
	}

	readonly cardIcon = computed(() => {
		const cardMap: Record<CardType, { icon: LucideIconData }> = {
			[CardType.CREDIT_CARD]: { icon: CreditCardIcon },
			[CardType.DEBIT_CARD]: { icon: BanknoteIcon },
		}
		return cardMap[this.card().type]
	})

	readonly textColorClass = computed(() => {
		return this.textColorClasses[this.card().color]
	})

	readonly typeLabel = computed(() => {
		const card = this.card()
		const base = { CREDIT_CARD: 'Credit', DEBIT_CARD: 'Debit' }[card.type]

		return base
	})

	readonly creditLimit = computed(() => {
		const creditLimit = this.card().creditLimit
		if (!creditLimit) return null
		return Number(creditLimit)
	})

	readonly monthlyExpenses = signal<number>(0)

	updateCard() {
		this.sheetService.create({
			zTitle: 'Edit Card',
			zContent: CardsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: CardsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.card().id,
				name: this.card().name,
				color: this.card().color,
				type: this.card().type,
				lastFour: this.card().lastFour,
				creditLimit: this.card().creditLimit,
				closingDay: this.card().closingDay,
				dueDay: this.card().dueDay,
				expirationDate: this.card().expirationDate,
				cvc: this.card().cvc,
				accountId: this.card().bankAccountId,
			} as iSheetData,
		})
	}

	deleteCard() {
		return this.dialogService.create({
			zTitle: `Remove goal?`,
			zDescription: `Are you sure you want to delete the recurring entry "${this.card().name}"? This action cannot be undone.`,
			zCancelText: 'Cancel',
			zOkText: 'Delete Card',
			zOkDestructive: true,
			zWidth: '500px',
			zOnOk: async () => {
				const walletId = this.card().id
				if (!walletId) return false

				try {
					const message = await lastValueFrom(
						this.cardsService.delete(walletId),
					)
					toast.success(message)
					this.cardsService.loadCards().subscribe() // Needs the subscribe because returns an observable on service
					return true
				} catch (err: any) {
					toast.error(err.error?.message || 'Failed to delete card')
					return false
				}
			},
		})
	}
}
