import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	signal,
} from '@angular/core'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { CreditCardIcon, LucideAngularModule, PlusIcon } from 'lucide-angular'
import { CardsForm } from '@/shared/components/cards/cards-form/cards-form'
import { CardsList } from '@/shared/components/cards/cards-list/cards-list'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import {
	ZardSelectComponent,
	ZardSelectItemComponent,
} from '@/shared/components/ui/select'
import { ZardSheetService } from '@/shared/components/ui/sheet'

@Component({
	selector: 'app-cards',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardButtonComponent,
		CardsList,
		ZardSelectComponent,
		ZardSelectItemComponent,
	],
	templateUrl: './cards.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cards implements OnInit {
	readonly CreditCardIcon = CreditCardIcon
	readonly PlusIcon = PlusIcon

	private readonly sheetService = inject(ZardSheetService)
	private readonly cardsService = inject(CardsService)
	private readonly bankAccountsService = inject(BankAccountsService)

	// Expose service signals to template
	readonly cards = this.cardsService.cards
	readonly loading = this.cardsService.loading
	readonly hasCards = this.cardsService.hasCards

	// account filter
	readonly bankAccounts = this.bankAccountsService.bankAccounts
	readonly selectedBankAccountId = signal<string | null>(null)

	ngOnInit(): void {
		this.cardsService.loadCards().subscribe()
		// Pre-load accounts for the form and filter
		this.bankAccountsService.loadBankAccounts().subscribe()
	}

	onBankAccountFilterChange(bankAccountId: string): void {
		const filterId = bankAccountId === 'all' ? null : bankAccountId
		this.selectedBankAccountId.set(filterId)
		this.cardsService.loadCards(filterId ?? undefined).subscribe()
	}

	openSheet() {
		this.sheetService.create({
			zTitle: 'New Card',
			zContent: CardsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create Card',
			zOnOk: (instance: CardsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
