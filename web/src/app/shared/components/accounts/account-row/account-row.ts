import { CurrencyPipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import {
	BuildingIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	HandCoinsIcon,
	LucideAngularModule,
	SquarePenIcon,
	Trash2Icon,
	TrendingUpIcon,
	WalletIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import type { iSheetData } from '../../bank-accounts/bank-accounts-form/bank-account-form.interface'
import { BankAccountsForm } from '../../bank-accounts/bank-accounts-form/bank-accounts-form'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import {
	ZardPopoverCloseDirective,
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '../../ui/popover'
import { ProviderLogo } from '../provider-logo/provider-logo'

@Component({
	selector: 'app-account-row',
	imports: [
		ProviderLogo,
		LucideAngularModule,
		CurrencyPipe,
		ZardBadgeComponent,
		ZardButtonComponent,
		RouterLink,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardPopoverCloseDirective,
		ZardDividerComponent,
	],
	templateUrl: './account-row.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountRow {
	readonly account = input.required<BankAccount>()
	readonly providerLogoUrl = input<string | null | undefined>()
	readonly iban = input<string | null | undefined>()

	readonly EllipsisVerticalIcon = EllipsisVerticalIcon
	readonly EyeIcon = EyeIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon

	private readonly dialogService = inject(ZardDialogService)
	private readonly bankAccountsService = inject(BankAccountsService)

	readonly isLinked = computed(() => !!this.account().isLinked)
	readonly canEdit = computed(() => !this.isLinked())

	readonly typeIcon = computed(() => {
		const map: Record<BankType, typeof BuildingIcon> = {
			[BankType.SAVINGS]: HandCoinsIcon,
			[BankType.INVESTMENT]: TrendingUpIcon,
			[BankType.WALLET]: WalletIcon,
			[BankType.CHECKING]: BuildingIcon,
		}
		return map[this.account().type] ?? BuildingIcon
	})

	readonly typeLabel = computed(() => {
		const map: Record<BankType, string> = {
			[BankType.SAVINGS]: 'Savings',
			[BankType.INVESTMENT]: 'Investment',
			[BankType.WALLET]: 'Wallet',
			[BankType.CHECKING]: 'Checking',
		}
		return map[this.account().type] ?? 'Bank Account'
	})

	readonly subtitle = computed(() => {
		const iban = this.iban()
		const suffix = iban ? `• ••••${iban.slice(-4)}` : ''
		return `${this.typeLabel()}${suffix}`
	})

	readonly balanceColorClass = computed(() => {
		const b = Number(this.account().balance)
		if (b < 0) return 'text-destructive'
		if (b === 0) return 'text-muted-foreground'
		return 'text-primary'
	})

	readonly badgeType = computed(() => {
		const b = Number(this.account().balance)
		if (b < 0) return 'negative'
		if (b === 0) return 'unavailable'
		return 'available'
	})

	readonly badgeLabel = computed(() => {
		const b = Number(this.account().balance)
		if (b < 0) return 'Negative'
		if (b === 0) return 'Unavailable'
		return 'Available'
	})

	editAccount() {
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
				'sm:rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.account().id,
				name: this.account().name,
				type: this.account().type,
				balance: this.account().balance,
			} as iSheetData,
		})
	}

	deleteAccount() {
		const id = this.account().id
		if (!id) return
		this.dialogService.create({
			zTitle: 'Remove account?',
			zDescription: `This action cannot be undone. Remove "${this.account().name}"?`,
			zCancelText: 'Cancel',
			zWidth: '450px',
			zOkText: 'Delete Account',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(
						this.bankAccountsService.delete(id),
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
				'sm:rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
