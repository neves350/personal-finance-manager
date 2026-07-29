import { computed, Injectable, inject, signal } from '@angular/core'
import type {
	AddDepositRequest,
	Deposit,
	GetDepositsResponse,
} from '@core/api/deposits.interface'
import { GoalsApi } from '@core/api/goals.api'
import type {
	CreateGoalRequest,
	Goal,
	UpdateGoalRequest,
} from '@core/api/goals.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class GoalsService {
	private readonly goalsApi = inject(GoalsApi)

	// Signal-based state
	readonly goals = signal<Goal[]>([])
	readonly depositsVersion = signal(0)
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)

	// Computed signals
	readonly hasGoals = computed(() => this.goals().length > 0)
	readonly activeGoals = computed(() =>
		this.goals().filter((goal) => !goal.isCompleted),
	)
	readonly completedGoals = computed(() =>
		this.goals().filter((goal) => goal.isCompleted),
	)

	loadGoals(): Observable<Goal[]> {
		this.loading.set(true)
		this.error.set(null)

		return this.goalsApi.findAll().pipe(
			tap({
				next: (response) => {
					this.goals.set(response)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load goals')
					this.loading.set(false)
				},
			}),
		)
	}

	create(data: CreateGoalRequest): Observable<Goal> {
		this.loading.set(true)

		return this.goalsApi.create(data).pipe(
			map((response) => response.goal),
			tap({
				next: (goal) => {
					this.goals.update((current) => [...current, goal])
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to create goal')
					this.loading.set(false)
				},
			}),
		)
	}

	findById(goalId: string): Observable<Goal> {
		return this.goalsApi.findById(goalId)
	}

	update(goalId: string, data: UpdateGoalRequest): Observable<Goal> {
		this.loading.set(true)

		return this.goalsApi
			.update(goalId, data)
			.pipe(
				switchMap((updatedGoal) =>
					this.loadGoals().pipe(map(() => updatedGoal)),
				),
			)
	}

	delete(goalId: string): Observable<string> {
		return this.goalsApi
			.delete(goalId)
			.pipe(
				switchMap((response) =>
					this.loadGoals().pipe(map(() => response.message)),
				),
			)
	}

	addDeposit(goalId: string, data: AddDepositRequest): Observable<Deposit> {
		this.loading.set(true)

		return this.goalsApi.addDeposit(goalId, data).pipe(
			tap({
				next: (response) => {
					this.goals.update((current) =>
						current.map((goal) => (goal.id === goalId ? response.goal : goal)),
					)
					this.depositsVersion.update((v) => v + 1)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to add deposit')
					this.loading.set(false)
				},
			}),
			map((response) => response.deposit),
		)
	}

	getDeposits(goalId: string): Observable<GetDepositsResponse> {
		return this.goalsApi.getDeposits(goalId)
	}
}
