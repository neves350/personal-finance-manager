import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	CreateRecurringRequest,
	CreateRecurringResponse,
	Recurring,
	RecurringActionResponse,
	RecurringsResponse,
	UpdateRecurringRequest,
} from './recurrings.interface'

@Injectable({
	providedIn: 'root',
})
export class RecurringsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/recurring`

	/**
	 * CREATE RECURRING
	 */
	create(data: CreateRecurringRequest): Observable<CreateRecurringResponse> {
		return this.http.post<CreateRecurringResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL RECURRINGS
	 */
	findAll(): Observable<RecurringsResponse> {
		return this.http.get<RecurringsResponse>(`${this.baseUrl}`, {
			withCredentials: true,
		})
	}

	/**
	 * UPDATE RECURRING
	 */
	update(
		recurringId: string,
		data: UpdateRecurringRequest,
	): Observable<Recurring> {
		return this.http
			.patch<{ updatedRecurring: Recurring }>(
				`${this.baseUrl}/${recurringId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.updatedRecurring))
	}

	/**
	 * DELETE RECURRING
	 */
	delete(
		recurringId: string,
		deleteTransactions = false,
	): Observable<RecurringActionResponse> {
		return this.http.delete<RecurringActionResponse>(
			`${this.baseUrl}/${recurringId}?deleteTransactions=${deleteTransactions}`,
			{
				withCredentials: true,
			},
		)
	}
}
