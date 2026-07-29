export class PaginationMeta {
	total: number // all db registers
	lastPage: number
	currentPage: number
	perPage: number // limit
	prev: number | null // prev page
	next: number | null // next page
}

export class PaginatedResult<T> {
	data: T[]
	meta: PaginationMeta
}
