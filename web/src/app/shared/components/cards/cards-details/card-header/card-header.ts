import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { type Card, CardType } from '@core/api/cards.interface'
import {
	ArrowLeftIcon,
	LucideAngularModule,
	SquarePenIcon,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { CardsForm } from '../../cards-form/cards-form'
import type { iSheetData } from '../../cards-form/cards-form.interface'

@Component({
	selector: 'app-card-header',
	imports: [ZardButtonComponent, LucideAngularModule, RouterLink],
	templateUrl: './card-header.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeader {
	readonly card = input.required<Card>()
	readonly ArrowLeftIcon = ArrowLeftIcon
	readonly SquarePenIcon = SquarePenIcon

	readonly typeLabel = computed(() =>
		this.card().type === CardType.CREDIT_CARD ? 'Credit Card' : 'Debit Card',
	)

	private readonly dialogService = inject(ZardDialogService)

	updateCard() {
		this.dialogService.create({
			zTitle: 'Edit Card',
			zContent: CardsForm,
			zWidth: '600px',
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
}
