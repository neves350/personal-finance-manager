import { DatePipe, NgTemplateOutlet } from '@angular/common'
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
import { NotificationsService } from '@core/services/notifications.service'
import {
	BellIcon,
	CheckCheckIcon,
	EllipsisIcon,
	LucideAngularModule,
	SearchIcon,
	Trash2Icon,
} from 'lucide-angular'
import { PageHeader } from '@/shared/components/page-header/page-header'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardInputDirective } from '@/shared/components/ui/input/input.directive'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import { ZardPaginationComponent } from '@/shared/components/ui/pagination'
import {
	ZardPopoverCloseDirective,
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '@/shared/components/ui/popover'
import {
	ZardTabComponent,
	ZardTabGroupComponent,
} from '@/shared/components/ui/tabs/tabs.component'

const ENTITY_ROUTE_MAP: Record<string, string> = {
	RECURRING: '/recurrings',
	ENVELOPE: '/budgets',
	GOAL: '/goals',
}

type TabFilter = 'unread' | 'read'

@Component({
	selector: 'app-notifications',
	imports: [
		NgTemplateOutlet,
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		ZardDividerComponent,
		ZardInputDirective,
		ZardLoaderComponent,
		ZardPaginationComponent,
		ZardPopoverCloseDirective,
		ZardPopoverComponent,
		ZardPopoverDirective,
		ZardTabComponent,
		ZardTabGroupComponent,
		DatePipe,
		PageHeader,
	],
	templateUrl: './notifications.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Notifications {
	private readonly router = inject(Router)
	private readonly api = inject(NotificationsApi)
	private readonly notificationsService = inject(NotificationsService)

	readonly BellIcon = BellIcon
	readonly CheckCheckIcon = CheckCheckIcon
	readonly SearchIcon = SearchIcon
	readonly EllipsisIcon = EllipsisIcon
	readonly Trash2Icon = Trash2Icon

	readonly loading = this.notificationsService.loading
	readonly groups = this.notificationsService.groupedNotifications
	readonly paginationMeta = this.notificationsService.paginationMeta
	readonly unreadCount = this.notificationsService.unreadCount

	readonly activeTab = signal<TabFilter>('unread')
	readonly searchQuery = signal('')
	readonly currentPage = signal(1)
	readonly pageSize = 20
	readonly readCount = signal(0)

	readonly unreadLabel = computed(() => `Unread (${this.unreadCount()})`)
	readonly readLabel = computed(() => `Read (${this.readCount()})`)

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
		this.loadReadCount()
	}

	onTabChange(event: { index: number }) {
		this.activeTab.set(event.index === 0 ? 'unread' : 'read')
		this.currentPage.set(1)
		this.loadPage(1)
	}

	onSearch(event: Event) {
		const value = (event.target as HTMLInputElement).value
		this.searchQuery.set(value)
		this.currentPage.set(1)
		this.loadPage(1)
	}

	onPageChange(page: number) {
		this.currentPage.set(page)
		this.loadPage(page)
	}

	markAllAsRead() {
		this.notificationsService.markAllAsRead().subscribe(() => {
			this.loadPage(this.currentPage())
			this.refreshCounts()
		})
	}

	onNotificationClick(notification: Notification) {
		if (!notification.isRead) {
			this.notificationsService.markAsRead(notification.id).subscribe()
		}
		const route = ENTITY_ROUTE_MAP[notification.entityType] ?? '/dashboard'
		this.router.navigate([route])
	}

	markAsRead(notification: Notification) {
		if (!notification.isRead) {
			this.notificationsService.markAsRead(notification.id).subscribe(() => {
				this.refreshCounts()
			})
		}
	}

	deleteNotification(notification: Notification) {
		this.notificationsService
			.deleteNotification(notification.id)
			.subscribe(() => {
				this.refreshCounts()
			})
	}

	private loadPage(page: number) {
		this.notificationsService
			.loadNotifications({
				page,
				limit: this.pageSize,
				isRead: this.activeTab() === 'read',
				search: this.searchQuery() || undefined,
			})
			.subscribe()
	}

	private loadReadCount() {
		this.api
			.findAll({ page: 1, limit: 1, isRead: true })
			.subscribe((res) => this.readCount.set(res.meta.total))
	}

	private refreshCounts() {
		this.notificationsService.refreshUnreadCount().subscribe()
		this.loadReadCount()
	}
}
