import { DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	inject,
} from '@angular/core'
import { Router } from '@angular/router'
import type { Notification } from '@core/api/notifications.interface'
import { NotificationsService } from '@core/services/notifications.service'
import {
	BellIcon,
	CheckCheckIcon,
	LucideAngularModule,
} from 'lucide-angular'
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
	private readonly dropdownService = inject(ZardDropdownService)
	readonly notificationsService = inject(NotificationsService)

	readonly BellIcon = BellIcon
	readonly CheckCheckIcon = CheckCheckIcon

	readonly groups = this.notificationsService.groupedNotifications
	readonly loading = this.notificationsService.loading
	readonly unreadCount = this.notificationsService.unreadCount
	readonly displayBadge = this.notificationsService.displayBadge

	onOpen() {
		this.notificationsService.loadNotifications().subscribe()
	}

	markAllAsRead() {
		this.notificationsService.markAllAsRead().subscribe()
	}

	onNotificationClick(notification: Notification) {
		if (!notification.isRead) {
			this.notificationsService.markAsRead(notification.id).subscribe()
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
