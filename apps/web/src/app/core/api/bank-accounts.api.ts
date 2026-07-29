import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	BalanceHistoryResponse,
	BankAccount,
	BankAccountActionResponse,
	BankAccountsResponse,
	CreateBankAccountRequest,
	CreateBankAccountResponse,
	RecentMovementsResponse,
	UpdateBankAccountRequest,
} from './bank-accounts.interface'

@Injectable({
	providedIn: 'root',
})
export class BankAccountsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/bank-account`

	/**
	 * CREATE BANK ACCOUNT
	 */
	create(
		data: CreateBankAccountRequest,
	): Observable<CreateBankAccountResponse> {
		return this.http.post<CreateBankAccountResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL BANK ACCOUNTS
	 */
	findAll(): Observable<BankAccountsResponse> {
		return this.http.get<BankAccountsResponse>(`${this.baseUrl}`, {
			withCredentials: true,
		})
	}

	/**
	 * GET BANK ACCOUNT BY ID
	 */
	findById(bankAccountId: string): Observable<BankAccount> {
		return this.http
			.get<{ card: BankAccount }>(`${this.baseUrl}/${bankAccountId}`, {
				withCredentials: true,
			})
			.pipe(map((response) => response.card))
	}

	/**
	 * UPDATE BANK ACCOUNT
	 */
	update(
		bankAccountId: string,
		data: UpdateBankAccountRequest,
	): Observable<BankAccount> {
		return this.http
			.patch<{ updatedBankAccount: BankAccount }>(
				`${this.baseUrl}/${bankAccountId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.updatedBankAccount))
	}

	/**
	 * DELETE BANK ACCOUNT
	 */
	delete(bankAccountId: string): Observable<BankAccountActionResponse> {
		return this.http.delete<BankAccountActionResponse>(
			`${this.baseUrl}/${bankAccountId}`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * GET BALANCE HISTORY
	 */
	getBalanceHistory(accountId: string): Observable<BalanceHistoryResponse> {
		return this.http.get<BalanceHistoryResponse>(
			`${this.baseUrl}/${accountId}/balance-history`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * GET RECENT MOVEMENTS
	 */
	getRecentMovements(accountId: string): Observable<RecentMovementsResponse> {
		return this.http.get<RecentMovementsResponse>(
			`${this.baseUrl}/${accountId}/recent-movements`,
			{
				withCredentials: true,
			},
		)
	}
}
