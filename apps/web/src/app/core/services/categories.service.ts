import { computed, Injectable, inject, signal } from '@angular/core'
import { CategoriesApi } from '@core/api/categories.api'
import type {
	Category,
	CategoryQueryParams,
	CreateCategoryRequest,
	UpdateCategoryRequest,
} from '@core/api/categories.interface'
import { map, Observable, switchMap, tap } from 'rxjs'

@Injectable({
	providedIn: 'root',
})
export class CategoriesService {
	private readonly categoriesApi = inject(CategoriesApi)

	// Signal-based state
	readonly categories = signal<Category[]>([])
	readonly loading = signal<boolean>(false)
	readonly error = signal<string | null>(null)

	// Computed signals
	readonly hasCategories = computed(() => this.categories().length > 0)
	readonly incomeCategories = computed(() =>
		this.categories().filter((category) => category.type === 'INCOME'),
	)
	readonly expenseCategories = computed(() =>
		this.categories().filter((category) => category.type === 'EXPENSE'),
	)

	loadCategories(params?: CategoryQueryParams): Observable<Category[]> {
		this.loading.set(true)
		this.error.set(null)

		return this.categoriesApi.findAll(params).pipe(
			tap({
				next: (response) => {
					this.categories.set(response)
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to load categories')
					this.loading.set(false)
				},
			}),
		)
	}

	create(data: CreateCategoryRequest): Observable<Category> {
		this.loading.set(true)

		return this.categoriesApi.create(data).pipe(
			map((response) => response.category),
			tap({
				next: (category) => {
					this.categories.update((current) => [...current, category])
					this.loading.set(false)
				},
				error: (err) => {
					this.error.set(err.message || 'Failed to create category')
					this.loading.set(false)
				},
			}),
		)
	}

	findById(categoryId: string): Observable<Category> {
		return this.categoriesApi.findById(categoryId)
	}

	update(
		categoryId: string,
		data: UpdateCategoryRequest,
	): Observable<Category> {
		this.loading.set(true)

		return this.categoriesApi
			.update(categoryId, data)
			.pipe(
				switchMap((updatedCategory) =>
					this.loadCategories().pipe(map(() => updatedCategory)),
				),
			)
	}

	delete(categoryId: string): Observable<string> {
		return this.categoriesApi
			.delete(categoryId)
			.pipe(
				switchMap((response) =>
					this.loadCategories().pipe(map(() => response.message)),
				),
			)
	}
}
