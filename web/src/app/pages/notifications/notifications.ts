import { DatePipe } from '@angular/common'
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { Router } from '@angular/router'
import type { Notification } from '@core/api/notifications.interface'
import { NotificationsService } from '@core/services/notifications.service'
import {
	BellIcon,
	CheckCheckIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import { ZardPaginationComponent } from '@/shared/components/ui/pagination'

const ENTITY_ROUTE_MAP: Record<string, string> = {
	RECURRING: '/recurrings',
	ENVELOPE: '/budgets',
	GOAL: '/goals',
}

@Component({
	selector: 'app-notifications',
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		ZardLoaderComponent,
		ZardPaginationComponent,
		DatePipe,
	],
	templateUrl: './notifications.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
	private readonly router = inject(Router)
	private readonly notificationsService = inject(NotificationsService)

	readonly BellIcon = BellIcon
	readonly CheckCheckIcon = CheckCheckIcon

	readonly loading = this.notificationsService.loading
	readonly groups = this.notificationsService.groupedNotifications
	readonly paginationMeta = this.notificationsService.paginationMeta
	readonly unreadCount = this.notificationsService.unreadCount

	readonly currentPage = signal(1)
	readonly pageSize = 20

	readonly totalPages = computed(() => {
		const meta = this.paginationMeta()
		return meta ? meta.lastPage : 1
	})

	readonly totalItems = computed(() => {
		const meta = this.paginationMeta()
		return meta ? meta.total : 0
	})

	readonly hasNotifications = computed(() => this.totalItems() > 0)

	constructor() {
		this.loadPage(1)
	}

	onPageChange(page: number) {
		this.currentPage.set(page)
		this.loadPage(page)
	}

	markAllAsRead() {
		this.notificationsService.markAllAsRead().subscribe()
	}

	onNotificationClick(notification: Notification) {
		if (!notification.isRead) {
			this.notificationsService.markAsRead(notification.id).subscribe()
		}
		const route = ENTITY_ROUTE_MAP[notification.entityType] ?? '/dashboard'
		this.router.navigate([route])
	}

	private loadPage(page: number) {
		this.notificationsService
			.loadNotifications({ page, limit: this.pageSize })
			.subscribe()
	}
}
