import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { TransactionsService } from '@core/services/transactions.service'
import {
	ArrowRightLeftIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { TransactionsExport } from '@/shared/components/transactions/transactions-export/transactions-export'
import { TransactionsForm } from '@/shared/components/transactions/transactions-form/transactions-form'
import { TransactionsList } from '@/shared/components/transactions/transactions-list/transactions-list'
import { TransactionsSummary } from '@/shared/components/transactions/transactions-summary/transactions-summary'
import { TransactionsToolbar } from '@/shared/components/transactions/transactions-toolbar/transactions-toolbar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { ZardDropdownImports } from '@/shared/components/ui/dropdown'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'

@Component({
	selector: 'app-transactions',
	imports: [
		ZardButtonComponent,
		LucideAngularModule,
		ZardCardComponent,
		ZardDropdownImports,
		TransactionsList,
		TransactionsToolbar,
		TransactionsSummary,
		ZardLoaderComponent,
		TransactionsExport,
	],
	templateUrl: './transactions.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
	private readonly transactionsService = inject(TransactionsService)
	private readonly dialogService = inject(ZardDialogService)

	readonly transactions = this.transactionsService.transactions
	readonly isLoading = this.transactionsService.loading
	readonly hasTransactions = this.transactionsService.hasTransactions

	readonly PlusIcon = PlusIcon
	readonly ArrowRightLeftIcon = ArrowRightLeftIcon

	readonly searchQuery = signal('')

	constructor() {
		this.transactionsService.loadTransactions().subscribe()
	}

	readonly filteredTransactions = computed(() => {
		const query = this.searchQuery().toLowerCase().trim()
		const txs = this.transactionsService.transactions()

		return query
			? txs.filter((t) => t.title.toLowerCase().includes(query))
			: txs
	})

	openDialog() {
		this.dialogService.create({
			zTitle: 'New Transaction',
			zContent: TransactionsForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Create Transaction',
			zOnOk: (instance: TransactionsForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
