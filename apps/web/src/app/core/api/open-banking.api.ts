import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import {
	ConnectSessionResponse,
	CreateConnectSessionRequest,
	DisconnectBankRequest,
	DisconnectBankResponse,
	HandleCallbackResponse,
	OpenBankingConnectionDetailsResponse,
	OpenBankingConnectionsResponse,
	ProvidersResponse,
	RefreshConnectionResponse,
	SyncConnectionResponse,
} from './open-banking.interface'

@Injectable({
	providedIn: 'root',
})
export class OpenBankingApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/open-banking`

	/**
	 * GET PROVIDERS
	 */
	getProviders() {
		return this.http.get<ProvidersResponse>(`${this.baseUrl}/providers`, {
			withCredentials: true,
		})
	}

	/**
	 * CREATE CONNECT SESSION
	 */
	createConnectSession(
		data: CreateConnectSessionRequest,
	): Observable<ConnectSessionResponse> {
		return this.http.post<ConnectSessionResponse>(
			`${this.baseUrl}/connect`,
			data,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * HANDLE CALLBACK
	 */
	handleCallback(): Observable<HandleCallbackResponse> {
		return this.http.post<HandleCallbackResponse>(
			`${this.baseUrl}/handle-callback`,
			{},
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * LIST CONNECTIONS
	 */
	listConnections(): Observable<OpenBankingConnectionsResponse> {
		return this.http.get<OpenBankingConnectionsResponse>(
			`${this.baseUrl}/connections`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * GET CONNECTIONS DETAILS
	 */
	getConnectionDetails(
		connectionId: string,
	): Observable<OpenBankingConnectionDetailsResponse> {
		return this.http.get<OpenBankingConnectionDetailsResponse>(
			`${this.baseUrl}/connections/${connectionId}`,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * REFRESH CONNECTION
	 */
	refreshConnection(
		connectionId: string,
	): Observable<RefreshConnectionResponse> {
		return this.http.post<RefreshConnectionResponse>(
			`${this.baseUrl}/connections/${connectionId}/refresh`,
			{},
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * SYNC CONNECTION
	 */
	syncConnection(connectionId: string): Observable<SyncConnectionResponse> {
		return this.http.post<SyncConnectionResponse>(
			`${this.baseUrl}/connections/${connectionId}/sync`,
			{},
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * DISCONNECT BANK
	 */
	disconnectBank(
		connectionId: string,
		data: DisconnectBankRequest,
	): Observable<DisconnectBankResponse> {
		return this.http.delete<DisconnectBankResponse>(
			`${this.baseUrl}/connections/${connectionId}`,
			{
				body: data,
				withCredentials: true,
				responseType: 'json' as const,
			},
		)
	}
}
