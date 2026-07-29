import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	StatisticsByCategory,
	StatisticsDailyTotals,
	StatisticsOverview,
	StatisticsQueryParams,
	StatisticsTrends,
} from './statistics.interface'

@Injectable({
	providedIn: 'root',
})
export class StatisticsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/statistics`

	/**
	 * GET OVERVIEW
	 */
	getOverview(params?: StatisticsQueryParams): Observable<StatisticsOverview> {
		return this.http.get<StatisticsOverview>(`${this.baseUrl}/overview`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET TRENDS
	 */
	getTrends(params?: StatisticsQueryParams): Observable<StatisticsTrends> {
		return this.http.get<StatisticsTrends>(`${this.baseUrl}/trends`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET BY CATEGORY
	 */
	getByCategory(
		params?: StatisticsQueryParams,
	): Observable<StatisticsByCategory> {
		return this.http.get<StatisticsByCategory>(`${this.baseUrl}/by-category`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET DAILY TOTALS
	 */
	getDailyTotals(
		params?: StatisticsQueryParams,
	): Observable<StatisticsDailyTotals[]> {
		return this.http.get<StatisticsDailyTotals[]>(
			`${this.baseUrl}/daily-totals`,
			{
				withCredentials: true,
				params: params as Record<string, string> | undefined,
			},
		)
	}
}
