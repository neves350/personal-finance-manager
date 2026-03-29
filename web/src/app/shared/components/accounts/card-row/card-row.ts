import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { Card, CardType } from '@core/api/cards.interface'
import { CardsService } from '@core/services/cards.service'
import {
	CreditCardIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	LucideAngularModule,
	SquarePenIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { CardsForm } from '../../cards/cards-form/cards-form'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import {
	ZardPopoverCloseDirective,
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '../../ui/popover'
import { ZardSheetService } from '../../ui/sheet'
import { ProviderLogo } from '../provider-logo/provider-logo'

@Component({
	selector: 'app-card-row',
	imports: [
		ProviderLogo,
		CurrencyPipe,
		ZardBadgeComponent,
		ZardButtonComponent,
		ZardPopoverDirective,
		ZardPopoverCloseDirective,
		LucideAngularModule,
		ZardPopoverComponent,
		ZardDividerComponent,
		RouterLink,
	],
	templateUrl: './card-row.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardRow {
	readonly card = input.required<Card>()
	readonly providerLogoUrl = input<string | null | undefined>()
	readonly balance = input<number>(0) // balance from bankAccount - coming from father page

	readonly EllipsisVerticalIcon = EllipsisVerticalIcon
	readonly EyeIcon = EyeIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly CreditCardIcon = CreditCardIcon

	private readonly sheetService = inject(ZardSheetService)
	private readonly dialogService = inject(ZardDialogService)
	private readonly cardsService = inject(CardsService)

	readonly isLinked = computed(() => !!this.card().isLinked)
	readonly canEdit = computed(() => !this.isLinked())

	readonly cardNetwork = computed(
		() => this.card().cardNetwork?.toLowerCase() ?? null,
	)

	readonly typeLabel = computed(() =>
		this.card().type === CardType.CREDIT_CARD ? 'Credit' : 'Debit',
	)

	readonly subtitle = computed(() => {
		const bankName = this.card().bankAccount?.name
		return bankName ? `${this.typeLabel()} · ${bankName}` : this.typeLabel()
	})

	readonly balanceColorClass = computed(() => {
		const b = this.balance()
		if (b < 0) return 'text-destructive'
		if (b === 0) return 'text-muted-foreground'
		return 'text-primary'
	})

	readonly badgeType = computed(() => {
		const b = this.balance()
		if (b < 0) return 'negative'
		if (b === 0) return 'unavailable'
		return 'available'
	})

	editCard() {
		this.sheetService.create({
			zTitle: 'Edit Card',
			zContent: CardsForm,
			zWidth: '600px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: CardsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-l-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
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
			},
		})
	}

	deleteCard() {
		const id = this.card().id
		if (!id) return
		this.dialogService.create({
			zTitle: 'Delete Card?',
			zDescription: `Remove "${this.card().name}"? This cannot be undone.`,
			zCancelText: 'Cancel',
			zWidth: '450px',
			zOkText: 'Delete Card',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					await lastValueFrom(this.cardsService.delete(id))
					toast.success('Card deleted')
					this.cardsService.loadCards().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to delete card')
					return false
				}
			},
			zCustomClasses:
				'rounded-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
