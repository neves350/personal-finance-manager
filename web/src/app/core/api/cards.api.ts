import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	Card,
	CardActionResponse,
	CardCashflowItem,
	CardMonthlyExpense,
	CardTransaction,
	CreateCardRequest,
	CreateCardResponse,
	UpdateCardRequest,
} from './cards.interface'

@Injectable({
	providedIn: 'root',
})
export class CardsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/cards`

	/**
	 * CREATE CARD
	 */
	create(data: CreateCardRequest): Observable<CreateCardResponse> {
		return this.http.post<CreateCardResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL CARDS
	 */
	findAll(bankAccountId?: string): Observable<Card[]> {
		return this.http
			.get<{ cards: Card[]; total: number }>(`${this.baseUrl}`, {
				withCredentials: true,
				...(bankAccountId && { params: { bankAccountId } }),
			})
			.pipe(map((response) => response.cards))
	}

	/**
	 * COUNT CARDS BY BANK ACCOUNT
	 */
	countByBankAccount(bankAccountId: string): Observable<number> {
		return this.http
			.get<{ cards: Card[]; total: number }>(`${this.baseUrl}`, {
				withCredentials: true,
				params: { bankAccountId },
			})
			.pipe(map((response) => response.total))
	}

	/**
	 * GET CARD BY ID
	 */
	findById(cardId: string): Observable<Card> {
		return this.http
			.get<{ card: Card }>(`${this.baseUrl}/${cardId}`, {
				withCredentials: true,
			})
			.pipe(map((response) => response.card))
	}

	/**
	 * UPDATE CARD
	 */
	update(cardId: string, data: UpdateCardRequest): Observable<Card> {
		return this.http
			.patch<{ updatedCard: Card }>(`${this.baseUrl}/${cardId}`, data, {
				withCredentials: true,
			})
			.pipe(map((response) => response.updatedCard))
	}

	/**
	 * DELETE CARD
	 */
	delete(cardId: string): Observable<CardActionResponse> {
		return this.http.delete<CardActionResponse>(`${this.baseUrl}/${cardId}`, {
			withCredentials: true,
		})
	}

	/**
	 * GET MONTHLY EXPENSES
	 */
	monthlyExpenses(
		cardId: string,
		params: { startDate: string; endDate: string },
	): Observable<CardMonthlyExpense> {
		return this.http.get<CardMonthlyExpense>(
			`${this.baseUrl}/${cardId}/expenses`,
			{ withCredentials: true, params },
		)
	}

	/**
	 * GET CASH FLOW
	 */
	cashflow(cardId: string): Observable<{ data: CardCashflowItem[] }> {
		return this.http.get<{ data: CardCashflowItem[] }>(
			`${this.baseUrl}/${cardId}/cashflow`,
			{ withCredentials: true },
		)
	}

	/**
	 * GET RECENT TRANSACTIONS
	 */
	recentTransactions(cardId: string, limit = 5): Observable<CardTransaction[]> {
		return this.http.get<CardTransaction[]>(
			`${this.baseUrl}/${cardId}/transactions`,
			{ withCredentials: true, params: { limit: limit.toString() } },
		)
	}
}
