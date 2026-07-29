import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	AddDepositRequest,
	AddDepositResponse,
	GetDepositsResponse,
} from './deposits.interface'
import type {
	CreateGoalRequest,
	CreateGoalResponse,
	Goal,
	GoalActionResponse,
	UpdateGoalRequest,
} from './goals.interface'

@Injectable({
	providedIn: 'root',
})
export class GoalsApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/goals`

	/**
	 * CREATE GOAL
	 */
	create(data: CreateGoalRequest): Observable<CreateGoalResponse> {
		return this.http.post<CreateGoalResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL GOALS
	 */
	findAll(): Observable<Goal[]> {
		return this.http.get<Goal[]>(`${this.baseUrl}`, {
			withCredentials: true,
		})
	}

	/**
	 * GET GOAL BY ID
	 */
	findById(goalId: string): Observable<Goal> {
		return this.http.get<Goal>(`${this.baseUrl}/${goalId}`, {
			withCredentials: true,
		})
	}

	/**
	 * UPDATE GOAL
	 */
	update(goalId: string, data: UpdateGoalRequest): Observable<Goal> {
		return this.http
			.patch<{ goal: Goal; message: string }>(
				`${this.baseUrl}/${goalId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.goal))
	}

	/**
	 * DELETE GOAL
	 */
	delete(goalId: string): Observable<GoalActionResponse> {
		return this.http.delete<GoalActionResponse>(`${this.baseUrl}/${goalId}`, {
			withCredentials: true,
		})
	}

	/**
	 * ADD DEPOSIT
	 */
	addDeposit(
		goalId: string,
		data: AddDepositRequest,
	): Observable<AddDepositResponse> {
		return this.http.post<AddDepositResponse>(
			`${this.baseUrl}/${goalId}/deposit`,
			data,
			{
				withCredentials: true,
			},
		)
	}

	/**
	 * GET DEPOSITS
	 */
	getDeposits(goalId: string): Observable<GetDepositsResponse> {
		return this.http.get<GetDepositsResponse>(
			`${this.baseUrl}/${goalId}/deposits`,
			{
				withCredentials: true,
			},
		)
	}
}
