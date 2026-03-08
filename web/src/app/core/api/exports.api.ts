import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { ExportsQueryParams } from './exports.interface'

@Injectable({
	providedIn: 'root',
})
export class ExportsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/export/transactions`

	/**
	 * DOWNLOAD CSV
	 */
	downloadCsv(params?: ExportsQueryParams): Observable<Blob> {
		return this.http.get(`${this.baseUrl}/csv`, {
			withCredentials: true,
			responseType: 'blob',
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * DOWNLOAD PDF
	 */
	downloadPdf(params?: ExportsQueryParams): Observable<Blob> {
		return this.http.get(`${this.baseUrl}/pdf`, {
			withCredentials: true,
			responseType: 'blob',
			params: params as Record<string, string> | undefined,
		})
	}
}
