import { TitleCasePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core'
import { Router } from '@angular/router'
import type { Transaction } from '@core/api/transactions.interface'
import { TransactionsService } from '@core/services/transactions.service'
import {
	EllipsisVerticalIcon,
	FilesIcon,
	LandmarkIcon,
	LucideAngularModule,
	RepeatIcon,
	SquarePenIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardPopoverComponent, ZardPopoverDirective } from '../../ui/popover'
import { ZardSheetService } from '../../ui/sheet'
import type { iTransactionData } from '../transactions-form/transactions-form.interface'

@Component({
	selector: 'app-transactions-row',
	host: { class: 'block' },
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardDividerComponent,
		ZardBadgeComponent,
		TitleCasePipe,
	],
	templateUrl: './transactions-row.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsRow {
	private readonly transactionsService = inject(TransactionsService)
	private readonly sheetService = inject(ZardSheetService)
	private readonly dialogService = inject(ZardDialogService)
	private readonly router = inject(Router)

	readonly transaction = input.required<Transaction>()

	readonly EllipsisVerticalIcon = EllipsisVerticalIcon
	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon
	readonly FilesIcon = FilesIcon
	readonly RepeatIcon = RepeatIcon
	readonly LandmarkIcon = LandmarkIcon

	readonly isOpenBanking = computed(
		() => this.transaction().source === 'OPEN_BANKING',
	)

	readonly recurringLabel = computed(() => {
		const r = this.transaction().recurring
		return r ? `Part of recurring: ${r.description}` : null
	})

	navigateToRecurring() {
		this.router.navigate(['/recurrings'])
	}

	readonly statusIcon = computed(() => {
		return this.transaction().isPaid
			? {
					dot: 'bg-primary shadow-[0_0_6px_var(--color-primary)]',
					label: 'Completed',
					class: 'text-primary font-medium',
				}
			: {
					dot: 'bg-warning shadow-[0_0_6px_var(--color-warning)]',
					label: 'Pending',
					class: 'text-warning font-medium',
				}
	})

	readonly typeBadge = computed(() => {
		return this.transaction().type === 'EXPENSE'
			? {
					dot: 'bg-destructive shadow-[0_0_6px_var(--color-destructive)]',
					label: 'Expense',
					class: 'text-destructive',
				}
			: {
					dot: 'bg-primary shadow-[0_0_6px_var(--color-primary)]',
					label: 'Income',
					class: 'text-primary',
				}
	})

	readonly formattedAmount = computed(() => {
		const { amount, type } = this.transaction()
		return type === 'INCOME' ? `+€${amount}` : `-€${amount}`
	})

	readonly amountClass = computed(() =>
		this.transaction().type === 'INCOME' ? 'text-primary' : 'text-destructive',
	)

	async updateTransaction() {
		const { TransactionsForm } = await import(
			'../transactions-form/transactions-form'
		)

		this.sheetService.create({
			zTitle: 'Edit Transaction',
			zContent: TransactionsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: InstanceType<typeof TransactionsForm>) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: this.transaction().id,
				title: this.transaction().title,
				isPaid: this.transaction().isPaid,
				type: this.transaction().type,
				date: this.transaction().date,
				categoryId: this.transaction().categoryId,
				amount: this.transaction().amount,
				bankAccountId: this.transaction().bankAccountId,
				source: this.transaction().source,
			} as iTransactionData,
		})
	}

	async duplicateTransaction() {
		const { TransactionsForm } = await import(
			'../transactions-form/transactions-form'
		)

		this.sheetService.create({
			zTitle: 'Duplicate Transaction',
			zContent: TransactionsForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create Transaction',
			zOnOk: (instance: InstanceType<typeof TransactionsForm>) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				title: this.transaction().title,
				isPaid: this.transaction().isPaid,
				type: this.transaction().type,
				date: this.transaction().date,
				categoryId: this.transaction().categoryId,
				amount: this.transaction().amount,
				bankAccountId: this.transaction().bankAccountId,
			} as iTransactionData,
		})
	}

	deleteTransaction() {
		const transactionId = this.transaction().id
		if (!transactionId) return

		return this.dialogService.create({
			zTitle: `Remove transaction`,
			zDescription: `Are you sure you want to delete the recurring entry "${this.transaction().title}"? This action cannot be undone.`,
			zCancelText: 'Cancel',
			zOkText: 'Delete Transaction',
			zWidth: '500px',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(
						this.transactionsService.delete(transactionId),
					)
					toast.success(message)
					this.transactionsService.loadTransactions().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to delete transaction')
					return false
				}
			},
		})
	}
}
