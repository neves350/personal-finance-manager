import { computed, Injectable, inject, signal } from '@angular/core'
import { BankAccountsApi } from '@core/api/bank-accounts.api'
import type {
	BalanceHistoryResponse,
	BankAccount,
	CreateBankAccountRequest,
	UpdateBankAccountRequest,
} from '@core/api/bank-accounts.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class BankAccountsService {
	private readonly bankAccountsApi = inject(BankAccountsApi)

	// Signal-based state
	readonly bankAccounts = signal<BankAccount[]>([])
	readonly totalBalance = signal<number>(0)
	readonly totalAccounts = signal<number>(0)
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)

	// Computed signals
	readonly hasBankAccounts = computed(() => this.bankAccounts().length > 0)

	loadBankAccounts(): Observable<BankAccount[]> {
		this.loading.set(true)
		this.error.set(null)

		return this.bankAccountsApi.findAll().pipe(
			tap({
				next: (response) => {
					this.bankAccounts.set(response.data)
					this.totalBalance.set(response.total)
					this.totalAccounts.set(response.count)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load bank accounts')
					this.loading.set(false)
				},
			}),
			map((response) => response.data),
		)
	}

	create(data: CreateBankAccountRequest): Observable<BankAccount> {
		this.loading.set(true)

		return this.bankAccountsApi.create(data).pipe(
			map((response) => response.bankAccount),
			switchMap((bankAccount) =>
				this.loadBankAccounts().pipe(map(() => bankAccount)),
			),
		)
	}

	findById(bankAccountId: string): Observable<BankAccount> {
		return this.bankAccountsApi.findById(bankAccountId)
	}

	update(
		bankAccountId: string,
		data: UpdateBankAccountRequest,
	): Observable<BankAccount> {
		this.loading.set(true)

		return this.bankAccountsApi
			.update(bankAccountId, data)
			.pipe(
				switchMap((updatedAccount) =>
					this.loadBankAccounts().pipe(map(() => updatedAccount)),
				),
			)
	}

	delete(bankAccountId: string): Observable<string> {
		return this.bankAccountsApi
			.delete(bankAccountId)
			.pipe(
				switchMap((response) =>
					this.loadBankAccounts().pipe(map(() => response.message)),
				),
			)
	}

	getBalanceHistory(accountId: string): Observable<BalanceHistoryResponse> {
		return this.bankAccountsApi.getBalanceHistory(accountId)
	}
}
