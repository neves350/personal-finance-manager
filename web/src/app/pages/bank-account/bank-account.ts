import { Component, computed, inject, type OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { type Card, CardType } from '@core/api/cards.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	ArrowRightLeftIcon,
	BuildingIcon,
	CoinsIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { AccountDialog } from '@/shared/components/accounts/account-dialog/account-dialog'
import { AccountRow } from '@/shared/components/accounts/account-row/account-row'
import { AccountsSection } from '@/shared/components/accounts/accounts-section/accounts-section'
import { CardRow } from '@/shared/components/accounts/card-row/card-row'
import { ConnectionRow } from '@/shared/components/accounts/connection-row/connection-row'
import { CardsForm } from '@/shared/components/cards/cards-form/cards-form'
import { TransfersForm } from '@/shared/components/transfers/transfers-form/transfers-form'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import { ZardSheetService } from '@/shared/components/ui/sheet'

@Component({
	selector: 'app-bank-account',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		ZardLoaderComponent,
		AccountsSection,
		CardRow,
		AccountRow,
		ConnectionRow,
	],
	templateUrl: './bank-account.html',
})
export class BankAccount implements OnInit {
	readonly CoinsIcon = CoinsIcon
	readonly PlusIcon = PlusIcon
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon
	readonly BuildingIcon = BuildingIcon

	private readonly route = inject(ActivatedRoute)
	private readonly dialogService = inject(ZardDialogService)
	private readonly sheetService = inject(ZardSheetService)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly cardsService = inject(CardsService)
	private readonly obService = inject(OpenBankingService)

	readonly isLoading = this.bankAccountsService.loading
	readonly syncing = signal(false)

	// sections
	readonly creditCards = computed(() =>
		this.cardsService.cards().filter((c) => c.type === CardType.CREDIT_CARD),
	)
	readonly debitCards = computed(() =>
		this.cardsService.cards().filter((c) => c.type === CardType.DEBIT_CARD),
	)
	readonly bankAccountsList = computed(() =>
		this.bankAccountsService.bankAccounts().filter((a) => !a.isCardAccount),
	)
	readonly connections = computed(() => this.obService.connections())

	readonly isEmpty = computed(
		() =>
			!this.creditCards().length &&
			!this.debitCards().length &&
			!this.bankAccountsList().length &&
			!this.connections().length,
	)

	readonly hasInactiveConnections = computed(() =>
		this.connections().some((c) => c.status === 'INACTIVE'),
	)

	// totals
	readonly creditCardsTotal = computed(() =>
		this.creditCards().reduce((sum, c) => sum + this.getCardBalance(c), 0),
	)
	readonly debitCardsTotal = computed(() =>
		this.debitCards().reduce((sum, c) => sum + this.getCardBalance(c), 0),
	)
	readonly bankAccountsTotal = computed(() =>
		this.bankAccountsList().reduce((sum, a) => sum + Number(a.balance), 0),
	)

	// helpers
	getProviderLogoForAccount(bankAccountId: string | undefined): string | null {
		if (!bankAccountId) return null
		return (
			this.connections().find((c) =>
				c.accounts?.some((a) => a.bankAccountId === bankAccountId),
			)?.providerLogoUrl ?? null
		)
	}

	getCardBalance(card: Card): number {
		if (!card.bankAccountId) return 0
		return Number(
			this.bankAccountsService
				.bankAccounts()
				.find((a) => a.id === card.bankAccountId)?.balance ?? 0,
		)
	}

	getIbanForAccount(bankAccountId: string | undefined): string | null {
		if (!bankAccountId) return null

		for (const conn of this.connections()) {
			const acc = conn.accounts?.find((a) => a.bankAccountId === bankAccountId)
			if (acc?.iban) return acc.iban
		}

		return null
	}

	ngOnInit(): void {
		this.obService.loadConnections().subscribe()

		// Check if returning from Salt Edge callback
		const isCallback =
			this.route.snapshot.queryParamMap.get('callback') === 'success'

		if (isCallback) {
			this.syncing.set(true)
			this.obService.handleCallback().subscribe({
				next: () => {
					toast.success('Bank connected successfully!')
					this.syncing.set(false)
					this.bankAccountsService.loadBankAccounts().subscribe()
					this.cardsService.loadCards().subscribe()
				},
				error: () => {
					toast.error('Failed to sync bank connection')
					this.syncing.set(false)
					this.bankAccountsService.loadBankAccounts().subscribe()
				},
			})
		} else {
			this.bankAccountsService.loadBankAccounts().subscribe()
			this.cardsService.loadCards().subscribe()
		}
	}

	openTransfer() {
		this.sheetService.create({
			zTitle: 'New Transfer',
			zContent: TransfersForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Send Transfer',
			zOnOk: (instance: TransfersForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	openAddCard() {
		this.sheetService.create({
			zTitle: 'Add Card',
			zContent: CardsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Send Transfer',
			zOnOk: (instance: CardsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	openAddAccount() {
		this.dialogService.create({
			zTitle: 'Add Account',
			zDescription: 'Choose how you want to add your account',
			zContent: AccountDialog,
			zWidth: '580px',
			zHideFooter: true,
			zCustomClasses:
				'rounded-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zOnOk: () => {},
		})
	}

	refreshAll() {
		this.bankAccountsService.loadBankAccounts().subscribe()
		this.cardsService.loadCards().subscribe()
	}
}
