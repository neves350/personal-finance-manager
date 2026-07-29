/**
 * ENUMS
 */
export enum CategoryType {
	INCOME = 'INCOME',
	EXPENSE = 'EXPENSE',
}

/**
 * CATEGORY
 */
export interface Category {
	id?: string
	title: string
	icon: string
	color?: string
	isDefault: boolean
	type: CategoryType
	createdAt?: string
	updatedAt?: string
}

/**
 * CREATE CATEGORY
 */
export interface CreateCategoryRequest {
	title: string
	icon: string
	color?: string
	type: CategoryType
}

/**
 * UPDATE CATEGORY
 */
export interface UpdateCategoryRequest {
	title?: string
	icon?: string
	color?: string
	type?: CategoryType
}

/**
 * CREATE RESPONSE
 */
export interface CreateCategoryResponse {
	category: Category
	message: string
}

/**
 * GENERIC RESPONSE
 */
export interface CategoryActionResponse {
	message: string
	success: boolean
}

/**
 * QUERY PARAMS
 */
export interface CategoryQueryParams {
	type?: CategoryType
}
