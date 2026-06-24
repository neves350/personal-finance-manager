export enum NotificationType {
	RECURRING_INCOME_EXPECTED = 'RECURRING_INCOME_EXPECTED',
	BUDGET_THRESHOLD_REACHED = 'BUDGET_THRESHOLD_REACHED',
	BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
	GOAL_COMPLETED = 'GOAL_COMPLETED',
	GOAL_DEADLINE_APPROACHING = 'GOAL_DEADLINE_APPROACHING',
}

export interface Notification {
	id: string
	userId: string
	type: NotificationType
	title: string
	message: string
	entityType: string
	entityId: string
	isRead: boolean
	year: number
	month: number
	createdAt: string
}

export interface NotificationsQueryParams {
	page?: number
	limit?: number
	isRead?: boolean
	search?: string
}

export interface NotificationsPaginationMeta {
	total: number
	lastPage: number
	currentPage: number
	perPage: number
	prev: number | null
	next: number | null
}

export interface NotificationsResponse {
	data: Notification[]
	meta: NotificationsPaginationMeta
}

export interface UnreadCountResponse {
	count: number
}
