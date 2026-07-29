import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map, Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import type {
	Category,
	CategoryActionResponse,
	CategoryQueryParams,
	CreateCategoryRequest,
	CreateCategoryResponse,
	UpdateCategoryRequest,
} from './categories.interface'

@Injectable({
	providedIn: 'root',
})
export class CategoriesApi {
	private readonly http = inject(HttpClient)
	private readonly baseUrl = `${environment.apiUrl}/categories`

	/**
	 * CREATE CATEGORY
	 */
	create(data: CreateCategoryRequest): Observable<CreateCategoryResponse> {
		return this.http.post<CreateCategoryResponse>(`${this.baseUrl}`, data, {
			withCredentials: true,
		})
	}

	/**
	 * GET ALL CATEGORIES
	 */
	findAll(params?: CategoryQueryParams): Observable<Category[]> {
		return this.http.get<Category[]>(`${this.baseUrl}`, {
			withCredentials: true,
			params: params as Record<string, string> | undefined,
		})
	}

	/**
	 * GET CATEGORY BY ID
	 */
	findById(categoryId: string): Observable<Category> {
		return this.http.get<Category>(`${this.baseUrl}/${categoryId}`, {
			withCredentials: true,
		})
	}

	/**
	 * UPDATE CATEGORY
	 */
	update(
		categoryId: string,
		data: UpdateCategoryRequest,
	): Observable<Category> {
		return this.http
			.patch<{ updatedCategory: Category }>(
				`${this.baseUrl}/${categoryId}`,
				data,
				{
					withCredentials: true,
				},
			)
			.pipe(map((response) => response.updatedCategory))
	}

	/**
	 * DELETE CATEGORY
	 */
	delete(categoryId: string): Observable<CategoryActionResponse> {
		return this.http.delete<CategoryActionResponse>(
			`${this.baseUrl}/${categoryId}`,
			{
				withCredentials: true,
			},
		)
	}
}
