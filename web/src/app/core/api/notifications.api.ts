import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import type { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	NotificationsQueryParams,
	NotificationsResponse,
	UnreadCountResponse,
} from './notifications.interface'

@Injectable({
	providedIn: 'root',
})
export class NotificationsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/notifications`

	findAll(query: NotificationsQueryParams = {}): Observable<NotificationsResponse> {
		let params = new HttpParams()
		if (query.page) params = params.set('page', query.page)
		if (query.limit) params = params.set('limit', query.limit)

		return this.http.get<NotificationsResponse>(this.baseUrl, {
			params,
			withCredentials: true,
		})
	}

	getUnreadCount(): Observable<UnreadCountResponse> {
		return this.http.get<UnreadCountResponse>(
			`${this.baseUrl}/unread-count`,
			{ withCredentials: true },
		)
	}

	markAsRead(id: string): Observable<void> {
		return this.http.patch<void>(
			`${this.baseUrl}/${id}/read`,
			{},
			{ withCredentials: true },
		)
	}

	markAllAsRead(): Observable<void> {
		return this.http.patch<void>(
			`${this.baseUrl}/read-all`,
			{},
			{ withCredentials: true },
		)
	}
}
