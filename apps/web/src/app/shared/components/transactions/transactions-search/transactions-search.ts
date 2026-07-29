import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	output,
	signal,
} from '@angular/core'
import {
	type TransactionsQueryParams,
	TransactionType,
} from '@core/api/transactions.interface'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CategoriesService } from '@core/services/categories.service'
import {
	FunnelIcon,
	LucideAngularModule,
	SearchIcon,
	XIcon,
} from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardDropdownImports } from '../../ui/dropdown'
import { ZardInputDirective } from '../../ui/input'
import { ZardSelectComponent, ZardSelectItemComponent } from '../../ui/select'

@Component({
	selector: 'app-transactions-search',
	imports: [
		LucideAngularModule,
		ZardInputDirective,
		ZardButtonComponent,
		ZardDividerComponent,
		ZardSelectComponent,
		ZardSelectItemComponent,
		ZardDropdownImports,
	],
	templateUrl: './transactions-search.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsSearch {
	private readonly categoriesService = inject(CategoriesService)
	private readonly bankAccountsService = inject(BankAccountsService)

	readonly search = output<string>()
	readonly filterChange = output<TransactionsQueryParams>()
	readonly filterReset = output<void>()

	readonly searchValue = signal<string>('')
	readonly showFilters = signal(false)
	readonly filterType = signal<string>('')
	readonly filterCategory = signal<string>('')
	readonly filterAccount = signal<string>('')

	readonly SearchIcon = SearchIcon
	readonly FunnelIcon = FunnelIcon
	readonly XIcon = XIcon

	readonly hasActivateFilters = computed(
		() =>
			!!this.filterType() ||
			!!this.filterCategory() ||
			!!this.filterAccount() ||
			!!this.searchValue(),
	)
	readonly categories = this.categoriesService.categories
	readonly accounts = this.bankAccountsService.bankAccounts

	constructor() {
		this.categoriesService.loadCategories().subscribe()
		this.bankAccountsService.loadBankAccounts().subscribe()
	}

	onSearch(event: Event) {
		const value = (event.target as HTMLInputElement).value
		this.searchValue.set(value)
		this.search.emit(value)
	}

	toggleFilter() {
		this.showFilters.update((v) => !v)
	}

	applyFilter(key: 'type' | 'category' | 'account', value: string | string[]) {
		const v = Array.isArray(value) ? (value[0] ?? '') : value

		if (key === 'type') this.filterType.set(v)
		if (key === 'category') this.filterCategory.set(v)
		if (key === 'account') this.filterAccount.set(v)

		const params: TransactionsQueryParams = {
			...(this.filterType() && { type: this.filterType() as TransactionType }),
			...(this.filterCategory() && { categoryId: this.filterCategory() }),
			...(this.filterAccount() && { accountId: this.filterAccount() }),
		}

		this.filterChange.emit(params)
	}

	reset() {
		this.filterType.set('')
		this.filterCategory.set('')
		this.filterAccount.set('')
		this.searchValue.set('')
		this.filterReset.emit()
	}
}
