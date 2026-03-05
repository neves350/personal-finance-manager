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
	CreditCardIcon,
	EllipsisIcon,
	EyeIcon,
	LucideAngularModule,
	SquarePenIcon,
	Trash2Icon,
	WalletIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardPopoverComponent, ZardPopoverDirective } from '../../ui/popover'
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

	private readonly dialogService = inject(ZardDialogService)
	private readonly cardsService = inject(CardsService)

	readonly WalletIcon = WalletIcon
	readonly CreditCardIcon = CreditCardIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly EyeIcon = EyeIcon
	readonly EllipsisIcon = EllipsisIcon

	readonly isCreditCard = computed(
		() => this.card().type === CardType.CREDIT_CARD,
	)

	private readonly colorClasses: Record<CardColor, string> = {
		[CardColor.GRAY]: 'bg-zinc-700',
		[CardColor.PURPLE]: 'bg-violet-700',
		[CardColor.BLUE]: 'bg-sky-500',
		[CardColor.GREEN]: 'bg-emerald-700',
		[CardColor.YELLOW]: 'bg-yellow-400',
		[CardColor.ORANGE]: 'bg-amber-500',
		[CardColor.RED]: 'bg-red-500',
		[CardColor.PINK]: 'bg-fuchsia-300',
	}

	private readonly textColorClasses: Record<CardColor, string> = {
		[CardColor.GRAY]: 'text-zinc-700',
		[CardColor.PURPLE]: 'text-violet-700',
		[CardColor.BLUE]: 'text-sky-500',
		[CardColor.GREEN]: 'text-emerald-700',
		[CardColor.YELLOW]: 'text-yellow-400',
		[CardColor.ORANGE]: 'text-amber-500',
		[CardColor.RED]: 'text-red-500',
		[CardColor.PINK]: 'text-fuchsia-300',
	}

	private readonly typeLabels: Record<CardType, string> = {
		[CardType.CREDIT_CARD]: 'Credit',
		[CardType.DEBIT_CARD]: 'Debit',
	}

	readonly bgColorClass = computed(() => {
		return this.colorClasses[this.card().color]
	})

	readonly textColorClass = computed(() => {
		return this.textColorClasses[this.card().color]
	})

	readonly typeLabel = computed(() => {
		return this.typeLabels[this.card().type]
	})

	readonly creditLimit = computed(() => {
		const creditLimit = this.card().creditLimit
		if (!creditLimit) return null
		return Number(creditLimit)
	})

	readonly monthlyExpenses = signal<number>(0)

	updateCard() {
		this.dialogService.create({
			zTitle: 'Edit Card',
			zContent: CardsForm,
			zWidth: '450px',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: CardsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
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
