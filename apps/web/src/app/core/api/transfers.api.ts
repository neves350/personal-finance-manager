import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	CreateTransferRequest,
	CreateTransferResponse,
	Transfer,
	TransfersQueryParams,
	TransfersResponse,
} from './transfers.interface'

@Injectable({
	providedIn: 'root',
})
export class TransfersApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/transfer`

	/**
	 * CREATE TRANSFER
	 */
	create(data: CreateTransferRequest): Observable<CreateTransferResponse> {
		return this.http.post<CreateTransferResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL TRANSFERS
	 */
	findAll(params?: TransfersQueryParams): Observable<TransfersResponse> {
		return this.http.get<TransfersResponse>(`${this.baseUrl}`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET TRANSFER BY ID
	 */
	findById(transferId: string): Observable<Transfer> {
		return this.http.get<Transfer>(`${this.baseUrl}/${transferId}`, {
			withCredentials: true,
		})
	}
}
