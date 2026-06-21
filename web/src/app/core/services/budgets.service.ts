import { computed, Injectable, inject, signal } from '@angular/core'
import { BudgetsApi } from '@core/api/budgets.api'
import type {
	Budget,
	BudgetListItem,
	CreateBudgetRequest,
	CreateEnvelopeRequest,
	Envelope,
	TransferEnvelopeRequest,
	TransferEnvelopeResponse,
	UpdateBudgetRequest,
	UpdateEnvelopeRequest,
} from '@core/api/budgets.interface'
import { map, Observable, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class BudgetsService {
	private readonly budgetsApi = inject(BudgetsApi)

	readonly budget = signal<Budget | null>(null)
	readonly budgetList = signal<BudgetListItem[]>([])
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)
	readonly selectedMonth = signal(new Date().getMonth() + 1)
	readonly selectedYear = signal(new Date().getFullYear())

	readonly hasBudget = computed(() => this.budget() !== null)
	readonly envelopes = computed(() => this.budget()?.envelopes ?? [])
	readonly summary = computed(() => this.budget()?.summary ?? null)
	readonly warningEnvelopes = computed(() =>
		this.envelopes().filter((e) => e.status === 'warning'),
	)
	readonly overspentEnvelopes = computed(() =>
		this.envelopes().filter((e) => e.status === 'overspent'),
	)
	readonly envelopesAbove80Pct = computed(
		() => this.envelopes().filter((e) => e.progress >= 80).length,
	)
	readonly topCriticalEnvelopes = computed(() =>
		[...this.envelopes()]
			.sort((a, b) => a.remainingAmount - b.remainingAmount)
			.slice(0, 3),
	)

	loadBudget(): Observable<Budget> {
		this.loading.set(true)
		this.error.set(null)

		return this.budgetsApi
			.findByMonthYear(this.selectedYear(), this.selectedMonth())
			.pipe(
				tap({
					next: (budget) => {
						this.budget.set(budget)
						this.loading.set(false)
					},
					error: (err) => {
						this.budget.set(null)
						this.error.set(err.error?.message || 'Failed to load budget')
						this.loading.set(false)
					},
				}),
			)
	}

	loadCurrent(): Observable<Budget> {
		this.loading.set(true)
		this.error.set(null)

		return this.budgetsApi.findCurrent().pipe(
			tap({
				next: (budget) => {
					this.budget.set(budget)
					this.selectedMonth.set(budget.month)
					this.selectedYear.set(budget.year)
					this.loading.set(false)
				},
				error: (err) => {
					this.budget.set(null)
					this.error.set(err.error?.message || 'Failed to load budget')
					this.loading.set(false)
				},
			}),
		)
	}

	loadAll(): Observable<BudgetListItem[]> {
		return this.budgetsApi
			.findAll()
			.pipe(tap((list) => this.budgetList.set(list)))
	}

	create(data: CreateBudgetRequest): Observable<Budget> {
		this.loading.set(true)

		return this.budgetsApi.create(data).pipe(
			map((response) => response.budget),
			tap({
				next: (budget) => {
					this.budget.set({
						...budget,
						envelopes: [],
						summary: {
							totalAllocated: 0,
							totalSpent: 0,
							totalRemaining: 0,
							envelopeCount: 0,
							overspentCount: 0,
							warningCount: 0,
						},
					})
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.error?.message || 'Failed to create budget')
					this.loading.set(false)
				},
			}),
		)
	}

	update(budgetId: string, data: UpdateBudgetRequest): Observable<Budget> {
		this.loading.set(true)

		return this.budgetsApi.update(budgetId, data).pipe(
			tap({
				next: (budget) => {
					this.budget.update((current) =>
						current ? { ...current, ...budget } : current,
					)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.error?.message || 'Failed to update budget')
					this.loading.set(false)
				},
			}),
		)
	}

	delete(budgetId: string): Observable<string> {
		return this.budgetsApi.delete(budgetId).pipe(
			map((response) => response.message),
			tap(() => this.budget.set(null)),
		)
	}

	addEnvelope(
		budgetId: string,
		data: CreateEnvelopeRequest,
	): Observable<Envelope> {
		this.loading.set(true)

		return this.budgetsApi.addEnvelope(budgetId, data).pipe(
			map((response) => response.envelope),
			tap({
				next: () => {
					this.loading.set(false)
					this.loadBudget().subscribe()
				},
				error: (err) => {
					this.error.set(err.error?.message || 'Failed to add envelope')
					this.loading.set(false)
				},
			}),
		)
	}

	updateEnvelope(
		budgetId: string,
		envelopeId: string,
		data: UpdateEnvelopeRequest,
	): Observable<Envelope> {
		this.loading.set(true)

		return this.budgetsApi.updateEnvelope(budgetId, envelopeId, data).pipe(
			map((response) => response.envelope),
			tap({
				next: () => {
					this.loading.set(false)
					this.loadBudget().subscribe()
				},
				error: (err) => {
					this.error.set(err.error?.message || 'Failed to update envelope')
					this.loading.set(false)
				},
			}),
		)
	}

	removeEnvelope(budgetId: string, envelopeId: string): Observable<string> {
		return this.budgetsApi.removeEnvelope(budgetId, envelopeId).pipe(
			map((response) => response.message),
			tap(() => this.loadBudget().subscribe()),
		)
	}

	transferEnvelopes(
		budgetId: string,
		data: TransferEnvelopeRequest,
	): Observable<TransferEnvelopeResponse> {
		this.loading.set(true)

		return this.budgetsApi.transferEnvelopes(budgetId, data).pipe(
			tap({
				next: () => {
					this.loading.set(false)
					this.loadBudget().subscribe()
				},
				error: (err) => {
					this.error.set(
						err.error?.message || 'Failed to transfer between envelopes',
					)
					this.loading.set(false)
				},
			}),
		)
	}

	copyPrevious(budgetId: string): Observable<Budget> {
		this.loading.set(true)

		return this.budgetsApi.copyPrevious(budgetId).pipe(
			tap({
				next: (budget) => {
					this.budget.set(budget)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(
						err.error?.message || 'Failed to copy from previous month',
					)
					this.loading.set(false)
				},
			}),
		)
	}

	navigateMonth(delta: number): void {
		let month = this.selectedMonth() + delta
		let year = this.selectedYear()

		if (month > 12) {
			month = 1
			year++
		} else if (month < 1) {
			month = 12
			year--
		}

		this.selectedMonth.set(month)
		this.selectedYear.set(year)
	}
}
