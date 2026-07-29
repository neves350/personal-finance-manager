import { computed, Injectable, inject, signal } from '@angular/core'
import { NotificationsApi } from '@core/api/notifications.api'
import type {
	Notification,
	NotificationsPaginationMeta,
	NotificationsQueryParams,
} from '@core/api/notifications.interface'
import { map, Observable, tap } from 'rxjs'

export interface NotificationGroup {
	label: string
	notifications: Notification[]
}

@Injectable({
	providedIn: 'root',
})
export class NotificationsService {
	private readonly api = inject(NotificationsApi)

	readonly notifications = signal<Notification[]>([])
	readonly paginationMeta = signal<NotificationsPaginationMeta | null>(null)
	readonly unreadCount = signal(0)
	readonly loading = signal(false)
	readonly panelOpen = signal(false)

	readonly displayBadge = computed(() => {
		const count = this.unreadCount()
		if (count === 0) return null
		return count > 9 ? '9+' : String(count)
	})

	readonly groupedNotifications = computed<NotificationGroup[]>(() => {
		const groups = new Map<string, Notification[]>()

		for (const notification of this.notifications()) {
			const dayKey = notification.createdAt.slice(0, 10)
			const existing = groups.get(dayKey)
			if (existing) {
				existing.push(notification)
			} else {
				groups.set(dayKey, [notification])
			}
		}

		const today = new Date().toISOString().slice(0, 10)
		const yesterday = new Date(Date.now() - 86_400_000)
			.toISOString()
			.slice(0, 10)

		return Array.from(groups.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.map(([date, notifications]) => ({
				label: this.buildDateLabel(date, today, yesterday),
				notifications,
			}))
	})

	loadNotifications(
		params?: NotificationsQueryParams,
	): Observable<Notification[]> {
		this.loading.set(true)

		return this.api.findAll(params).pipe(
			tap({
				next: (response) => {
					this.notifications.set(response.data)
					this.paginationMeta.set(response.meta)
					this.loading.set(false)
				},
				error: () => {
					this.loading.set(false)
				},
			}),
			map((response) => response.data),
		)
	}

	refreshUnreadCount(): Observable<number> {
		return this.api.getUnreadCount().pipe(
			tap((response) => this.unreadCount.set(response.count)),
			map((response) => response.count),
		)
	}

	markAsRead(id: string): Observable<void> {
		return this.api.markAsRead(id).pipe(
			tap(() => {
				this.notifications.update((list) =>
					list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
				)
				this.unreadCount.update((c) => Math.max(0, c - 1))
			}),
		)
	}

	markAllAsRead(): Observable<void> {
		return this.api.markAllAsRead().pipe(
			tap(() => {
				this.notifications.update((list) =>
					list.map((n) => ({ ...n, isRead: true })),
				)
				this.unreadCount.set(0)
			}),
		)
	}

	deleteNotification(id: string): Observable<void> {
		return this.api.delete(id).pipe(
			tap(() => {
				const removed = this.notifications().find((n) => n.id === id)
				this.notifications.update((list) => list.filter((n) => n.id !== id))
				if (removed && !removed.isRead) {
					this.unreadCount.update((c) => Math.max(0, c - 1))
				}
			}),
		)
	}

	togglePanel() {
		this.panelOpen.update((open) => !open)
	}

	closePanel() {
		this.panelOpen.set(false)
	}

	private buildDateLabel(
		date: string,
		today: string,
		yesterday: string,
	): string {
		if (date === today) return 'Today'
		if (date === yesterday) return 'Yesterday'
		return new Date(date).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
		})
	}
}
