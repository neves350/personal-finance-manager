import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	signal,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	Clock2Icon,
	CoinsIcon,
	CreditCardIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	HandCoinsIcon,
	LandmarkIcon,
	Link2OffIcon,
	LinkIcon,
	LucideAngularModule,
	RefreshCwIcon,
	RotateCwIcon,
	SquarePenIcon,
	Trash2Icon,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletMinimalIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import {
	ZardPopoverCloseDirective,
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '../../ui/popover'
import type { iSheetData } from '../bank-accounts-form/bank-account-form.interface'
import { BankAccountsForm } from '../bank-accounts-form/bank-accounts-form'

@Component({
	selector: 'app-bank-accounts-card',
	imports: [
		ZardCardComponent,
		LucideAngularModule,
		ZardButtonComponent,
		ZardDividerComponent,
		ZardPopoverCloseDirective,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardBadgeComponent,
		RouterLink,
	],
	templateUrl: './bank-accounts-card.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block h-full',
	},
})
export class BankAccountsCard {
	readonly account = input.required<BankAccount>()

	private readonly dialogService = inject(ZardDialogService)
	private readonly bankAccountsService = inject(BankAccountsService)
	private readonly cardsService = inject(CardsService)
	private readonly openBankingService = inject(OpenBankingService)

	readonly EllipsisVerticalIcon = EllipsisVerticalIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly EyeIcon = EyeIcon
	readonly Clock2Icon = Clock2Icon
	readonly LinkIcon = LinkIcon
	readonly Link2OffIcon = Link2OffIcon
	readonly LandmarkIcon = LandmarkIcon
	readonly RotateCwIcon = RotateCwIcon
	readonly RefreshCwIcon = RefreshCwIcon

	readonly syncing = signal(false)
	readonly refreshing = signal(false)
	readonly reconnecting = signal(false)

	/** Find the OpenBanking connection that owns this account */
	private readonly connectionFromService = computed(() =>
		this.openBankingService
			.connections()
			.find((c) =>
				c.accounts?.some((a) => a.bankAccountId === this.account().id),
			),
	)

	/** Permanent marker — account originated from Open Banking */
	readonly isLinked = computed(() => !!this.account().isLinked)

	/** Currently connected and syncing */
	readonly isActive = computed(
		() => this.isLinked() && !!this.connectionFromService(),
	)

	/** Was linked but connection was removed (keepData disconnect) */
	readonly isDisconnected = computed(
		() => this.isLinked() && !this.connectionFromService(),
	)

	private readonly connection = computed(() => this.connectionFromService())

	readonly badgeType = computed(() => {
		const balance = Number(this.account().balance)
		if (balance < 0) return 'negative'
		if (balance === 0) return 'unavailable'
		return 'available'
	})
	readonly badgeLabel = computed(() => {
		const balance = Number(this.account().balance)
		if (balance < 0) return 'Negative'
		if (balance === 0) return 'Unavailable'
		return 'Available'
	})

	private readonly balanceDelta = computed(() => {
		const { balance, initialBalance } = this.account()
		return Number(balance) - Number(initialBalance ?? 0)
	})
	readonly hasBalanceChange = computed(() => this.balanceDelta() !== 0)
	readonly balanceSinceStart = computed(() => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'EUR',
			signDisplay: 'always',
		}).format(this.balanceDelta())
	})
	readonly trendIcon = computed(() =>
		this.balanceDelta() >= 0 ? TrendingUpIcon : TrendingDownIcon,
	)
	readonly trendColorClass = computed(() =>
		this.balanceDelta() < 0 ? 'text-destructive' : 'text-primary',
	)
	readonly lastMovementRelative = computed(() => {
		const updatedAt = this.account().updatedAt
		if (!updatedAt) return null
		const now = Date.now()
		const then = new Date(updatedAt).getTime()
		const diffMs = now - then
		const diffSec = Math.floor(diffMs / 1000)
		const diffMin = Math.floor(diffSec / 60)
		const diffHour = Math.floor(diffMin / 60)
		const diffDay = Math.floor(diffHour / 24)

		const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
		if (diffDay > 0) return rtf.format(-diffDay, 'day')
		if (diffHour > 0) return rtf.format(-diffHour, 'hour')
		if (diffMin > 0) return rtf.format(-diffMin, 'minute')
		return rtf.format(-diffSec, 'second')
	})

	private readonly typeLabels: Record<BankType, string> = {
		[BankType.WALLET]: 'Wallet',
		[BankType.CHECKING]: 'Checking',
		[BankType.SAVINGS]: 'Savings',
		[BankType.INVESTMENT]: 'Investment',
	}

	readonly bankAccountIcon = computed(() => {
		const iconMap: Record<BankType, typeof CreditCardIcon> = {
			[BankType.WALLET]: WalletMinimalIcon,
			[BankType.CHECKING]: LandmarkIcon,
			[BankType.SAVINGS]: HandCoinsIcon,
			[BankType.INVESTMENT]: CoinsIcon,
		}
		return iconMap[this.account().type]
	})

	readonly balanceColorClass = computed(() => {
		const balance = Number(this.account().balance)
		if (balance < 0) return 'text-destructive'
		if (balance === 0) return 'text-muted-foreground'
		return 'text-primary'
	})

	readonly typeLabel = computed(() => {
		return this.typeLabels[this.account().type]
	})

	readonly formattedBalance = computed(() => {
		const { balance } = this.account()
		if (balance === null || balance === undefined) return null

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'EUR',
			signDisplay: 'always',
		}).format(Number(balance))
	})

	// Track linked cards count
	private readonly linkedCardsCount = signal<number | null>(null)
	readonly canDelete = computed(() => this.linkedCardsCount() === 0)

	constructor() {
		// Load linked cards count when account changes
		effect(() => {
			const bankAccountId = this.account().id
			if (bankAccountId) {
				this.cardsService
					.countByBankAccount(bankAccountId)
					.subscribe((count) => {
						this.linkedCardsCount.set(count)
					})
			}
		})
	}

	updateCard() {
		this.dialogService.create({
			zTitle: 'Edit Account',
			zContent: BankAccountsForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: BankAccountsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.account().id,
				name: this.account().name,
				type: this.account().type,
				balance: this.account().balance,
			} as iSheetData,
		})
	}

	syncConnection() {
		const conn = this.connection()
		if (!conn?.id) return
		this.syncing.set(true)
		this.openBankingService.syncConnection(conn.id).subscribe({
			next: () => {
				this.syncing.set(false)
				toast.success(`${conn.providerName} synced successfully`)
				this.bankAccountsService.loadBankAccounts().subscribe()
			},
			error: (err) => {
				this.syncing.set(false)
				toast.error(err.error?.message || 'Failed to sync')
			},
		})
	}

	refreshConnection() {
		const conn = this.connection()
		if (!conn?.id) return
		this.refreshing.set(true)
		this.openBankingService.refreshConnection(conn.id).subscribe({
			next: () => {
				this.refreshing.set(false)
				toast.success(`${conn.providerName} refresh started`)
			},
			error: (err) => {
				this.refreshing.set(false)
				toast.error(err.error?.message || 'Failed to refresh')
			},
		})
	}

	reconnectConnection() {
		this.reconnecting.set(true)
		this.openBankingService.connectBank('fakebank_simple_xf').subscribe({
			next: (url) => {
				window.location.href = url
			},
			error: () => {
				this.reconnecting.set(false)
				toast.error('Failed to start reconnection')
			},
		})
	}

	disconnectConnection() {
		const conn = this.connection()
		if (!conn?.id) return

		const accountCount = conn.accounts?.length ?? 0
		const accountText =
			accountCount > 1
				? `All ${accountCount} accounts from this connection`
				: 'This account'

		this.dialogService.create({
			zTitle: `Disconnect ${conn.providerName}?`,
			zDescription: `${accountText} will be marked as disconnected. Synced transactions remain.`,
			zCancelText: 'Cancel',
			zWidth: '450px',
			zOkText: 'Disconnect',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					await lastValueFrom(
						this.openBankingService.disconnect(conn.id!, true),
					)
					toast.success(`${conn.providerName} disconnected`)
					this.bankAccountsService.loadBankAccounts().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to disconnect')
					return false
				}
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	deleteCard() {
		const bankAccountId = this.account().id
		if (!bankAccountId) return

		return this.dialogService.create({
			zTitle: 'Remove account?',
			zDescription: `This action cannot be undone, you sure that want remove ${this.account().name}.`,
			zCancelText: 'Cancel',
			zWidth: '450px',
			zOkText: 'Delete Account',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(
						this.bankAccountsService.delete(bankAccountId),
					)
					toast.success(message)
					this.bankAccountsService.loadBankAccounts().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to delete account')
					return false
				}
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
