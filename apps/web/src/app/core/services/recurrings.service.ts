import { computed, Injectable, inject, signal } from '@angular/core'
import { RecurringsApi } from '@core/api/recurrings.api'
import {
	type CreateRecurringRequest,
	FrequencyType,
	type Recurring,
	RecurringType,
	type UpdateRecurringRequest,
} from '@core/api/recurrings.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class RecurringsService {
	private readonly recurringsApi = inject(RecurringsApi)

	readonly recurrings = signal<Recurring[]>([])
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)
	readonly hasRecurrings = computed(() => this.recurrings().length > 0)

	readonly monthSummary = computed(() => {
		let income = 0
		let expenses = 0

		for (const recurring of this.recurrings()) {
			const amount = Number(recurring.amount)
			const monthly =
				recurring.frequency === FrequencyType.ANNUAL ? amount / 12 : amount

			if (recurring.type === RecurringType.INCOME) {
				income += monthly
			} else {
				expenses += monthly
			}
		}

		return { income, expenses, balance: income - expenses }
	})

	loadRecurrings(): Observable<Recurring[]> {
		this.loading.set(true)
		this.error.set(null)

		return this.recurringsApi.findAll().pipe(
			tap({
				next: (response) => {
					this.recurrings.set(response.recurrings)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(
						err.message || 'Failed to load recurrings transactions',
					)
					this.loading.set(false)
				},
			}),
			map((response) => response.recurrings),
		)
	}

	create(data: CreateRecurringRequest): Observable<Recurring> {
		this.loading.set(true)

		return this.recurringsApi.create(data).pipe(
			map((response) => response.recurring),
			switchMap((recurring) =>
				this.loadRecurrings().pipe(map(() => recurring)),
			),
		)
	}

	update(
		recurringId: string,
		data: UpdateRecurringRequest,
	): Observable<Recurring> {
		this.loading.set(true)

		return this.recurringsApi
			.update(recurringId, data)
			.pipe(
				switchMap((updatedRecurring) =>
					this.loadRecurrings().pipe(map(() => updatedRecurring)),
				),
			)
	}

	confirm(recurringId: string): Observable<Recurring> {
		return this.update(recurringId, { autoDetected: false })
	}

	delete(recurringId: string, deleteTransactions = false): Observable<string> {
		this.loading.set(true)

		return this.recurringsApi
			.delete(recurringId, deleteTransactions)
			.pipe(
				switchMap((response) =>
					this.loadRecurrings().pipe(map(() => response.message)),
				),
			)
	}
}
