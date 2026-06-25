import { DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { Router } from '@angular/router'
import { NotificationsApi } from '@core/api/notifications.api'
import type { Notification } from '@core/api/notifications.interface'
import {
	type NotificationGroup,
	NotificationsService,
} from '@core/services/notifications.service'
import { BellIcon, CheckCheckIcon, LucideAngularModule } from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardDropdownImports } from '../../ui/dropdown'
import { ZardDropdownService } from '../../ui/dropdown/dropdown.service'

const ENTITY_ROUTE_MAP: Record<string, string> = {
	RECURRING: '/recurrings',
	ENVELOPE: '/budgets',
	GOAL: '/goals',
}

@Component({
	selector: 'app-notification-panel',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardDividerComponent,
		ZardDropdownImports,
		DatePipe,
	],
	templateUrl: './notification-panel.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPanel {
	private readonly router = inject(Router)
	private readonly api = inject(NotificationsApi)
	private readonly dropdownService = inject(ZardDropdownService)
	private readonly notificationsService = inject(NotificationsService)

	readonly BellIcon = BellIcon
	readonly CheckCheckIcon = CheckCheckIcon

	private readonly panelNotifications = signal<Notification[]>([])

	readonly groups = computed<NotificationGroup[]>(() => {
		const groups = new Map<string, Notification[]>()

		for (const notification of this.panelNotifications()) {
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
				label:
					date === today
						? 'Today'
						: date === yesterday
							? 'Yesterday'
							: new Date(date).toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
								}),
				notifications,
			}))
	})

	readonly unreadCount = this.notificationsService.unreadCount
	readonly displayBadge = this.notificationsService.displayBadge

	onOpen() {
		this.api.findAll({ limit: 10, isRead: false }).subscribe((response) => {
			this.panelNotifications.set(response.data)
		})
	}

	markAllAsRead() {
		this.notificationsService.markAllAsRead().subscribe(() => {
			this.panelNotifications.update((list) =>
				list.map((n) => ({ ...n, isRead: true })),
			)
		})
	}

	onNotificationClick(notification: Notification) {
		if (!notification.isRead) {
			this.notificationsService.markAsRead(notification.id).subscribe()
			this.panelNotifications.update((list) =>
				list.map((n) =>
					n.id === notification.id ? { ...n, isRead: true } : n,
				),
			)
		}
		this.dropdownService.close()
		const route = ENTITY_ROUTE_MAP[notification.entityType] ?? '/dashboard'
		this.router.navigate([route])
	}

	navigateToAll() {
		this.dropdownService.close()
		this.router.navigate(['/notifications'])
	}
}
