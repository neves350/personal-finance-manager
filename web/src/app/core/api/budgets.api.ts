import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	Budget,
	BudgetActionResponse,
	BudgetListItem,
	CreateBudgetRequest,
	CreateBudgetResponse,
	CreateEnvelopeRequest,
	EnvelopeResponse,
	TransferEnvelopeRequest,
	TransferEnvelopeResponse,
	UpdateBudgetRequest,
	UpdateEnvelopeRequest,
} from './budgets.interface'

@Injectable({
	providedIn: 'root',
})
export class BudgetsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/budgets`

	/**
	 * CREATE BUDGET
	 */
	create(data: CreateBudgetRequest): Observable<CreateBudgetResponse> {
		return this.http.post<CreateBudgetResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET CURRENT MONTH BUDGET
	 */
	findCurrent(): Observable<Budget> {
		return this.http.get<Budget>(`${this.baseUrl}/current`, {
			withCredentials: true,
		})
	}

	/**
	 * GET BUDGET BY MONTH/YEAR
	 */
	findByMonthYear(year: number, month: number): Observable<Budget> {
		return this.http.get<Budget>(`${this.baseUrl}/${year}/${month}`, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL BUDGETS
	 */
	findAll(): Observable<BudgetListItem[]> {
		return this.http.get<BudgetListItem[]>(`${this.baseUrl}`, {
			withCredentials: true,
		})
	}

	/**
	 * UPDATE BUDGET
	 */
	update(budgetId: string, data: UpdateBudgetRequest): Observable<Budget> {
		return this.http
			.patch<{ budget: Budget; message: string }>(
				`${this.baseUrl}/${budgetId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.budget))
	}

	/**
	 * DELETE BUDGET
	 */
	delete(budgetId: string): Observable<BudgetActionResponse> {
		return this.http.delete<BudgetActionResponse>(
			`${this.baseUrl}/${budgetId}`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * ADD ENVELOPE
	 */
	addEnvelope(
		budgetId: string,
		data: CreateEnvelopeRequest,
	): Observable<EnvelopeResponse> {
		return this.http.post<EnvelopeResponse>(
			`${this.baseUrl}/${budgetId}/envelopes`,
			data,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * UPDATE ENVELOPE
	 */
	updateEnvelope(
		budgetId: string,
		envelopeId: string,
		data: UpdateEnvelopeRequest,
	): Observable<EnvelopeResponse> {
		return this.http.patch<EnvelopeResponse>(
			`${this.baseUrl}/${budgetId}/envelopes/${envelopeId}`,
			data,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * REMOVE ENVELOPE
	 */
	removeEnvelope(
		budgetId: string,
		envelopeId: string,
	): Observable<BudgetActionResponse> {
		return this.http.delete<BudgetActionResponse>(
			`${this.baseUrl}/${budgetId}/envelopes/${envelopeId}`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * TRANSFER BETWEEN ENVELOPES
	 */
	transferEnvelopes(
		budgetId: string,
		data: TransferEnvelopeRequest,
	): Observable<TransferEnvelopeResponse> {
		return this.http.post<TransferEnvelopeResponse>(
			`${this.baseUrl}/${budgetId}/envelopes/transfer`,
			data,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * COPY PREVIOUS MONTH ENVELOPES
	 */
	copyPrevious(budgetId: string): Observable<Budget> {
		return this.http.post<Budget>(
			`${this.baseUrl}/${budgetId}/copy-previous`,
			{},
			{
				withCredentials: true,
			},
		)
	}
}
