import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import type {
	ChangePasswordRequest,
	UpdateUserRequest,
	User,
	UserActionResponse,
} from '@core/api/users.interface'
import { map, type Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
	providedIn: 'root',
})
export class UsersService {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/users`

	findById(userId: string): Observable<User> {
		return this.http.get<User>(`${this.baseUrl}/${userId}`, {
			withCredentials: true,
		})
	}

	update(userId: string, data: UpdateUserRequest): Observable<User> {
		return this.http.patch<User>(`${this.baseUrl}/${userId}`, data, {
			withCredentials: true,
		})
	}

	changePassword(
		userId: string,
		data: ChangePasswordRequest,
	): Observable<string> {
		return this.http
			.patch<UserActionResponse>(`${this.baseUrl}/${userId}/password`, data, {
				withCredentials: true,
			})
			.pipe(map((response) => response.message))
	}

	delete(userId: string): Observable<string> {
		return this.http
			.delete<UserActionResponse>(`${this.baseUrl}/${userId}`, {
				withCredentials: true,
			})
			.pipe(map((response) => response.message))
	}
}
