import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	CreateTransactionRequest,
	CreateTransactionResponse,
	Transaction,
	TransactionActionResponse,
	TransactionsQueryParams,
	TransactionsResponse,
	UpdateTransactionRequest,
} from './transactions.interface'

@Injectable({
	providedIn: 'root',
})
export class TransactionsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/transactions`

	/**
	 * CREATE TRANSACTION
	 */
	create(
		data: CreateTransactionRequest,
	): Observable<CreateTransactionResponse> {
		return this.http.post<CreateTransactionResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL TRANSACTIONS
	 */
	findAll(params?: TransactionsQueryParams): Observable<TransactionsResponse> {
		return this.http.get<TransactionsResponse>(`${this.baseUrl}`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET TRANSACTION BY ID
	 */
	findById(transactionId: string): Observable<Transaction> {
		return this.http.get<Transaction>(`${this.baseUrl}/${transactionId}`, {
			withCredentials: true,
		})
	}

	/**
	 * UPDATE TRANSACTION
	 */
	update(
		transactionId: string,
		data: UpdateTransactionRequest,
	): Observable<Transaction> {
		return this.http
			.patch<{ updatedTransaction: Transaction }>(
				`${this.baseUrl}/${transactionId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.updatedTransaction))
	}

	/**
	 * DELETE TRANSACTION
	 */
	delete(transactionId: string): Observable<TransactionActionResponse> {
		return this.http.delete<TransactionActionResponse>(
			`${this.baseUrl}/${transactionId}`,
			{
				withCredentials: true,
			},
		)
	}
}
