import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router } from '@angular/router'
import { NotificationsService } from '@core/services/notifications.service'
import { LucideAngularModule, SlashIcon } from 'lucide-angular'
import { filter, interval, map, startWith, switchMap } from 'rxjs'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'
import { NotificationPanel } from '../notification/notification-panel/notification-panel'
import { ProfileButton } from '../profile-button/profile-button'
import { Theme } from '../theme/theme'
import {
	ZardBreadcrumbComponent,
	ZardBreadcrumbItemComponent,
} from '../ui/breadcrumb'
import { ZardDividerComponent } from '../ui/divider'

interface BreadcrumbItem {
	label: string
	url?: string
}

const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
	'/dashboard': [{ label: 'Main Menu' }, { label: 'Dashboard' }],
	'/accounts': [{ label: 'Main Menu' }, { label: 'Accounts' }],
	'/account-details': [{ label: 'Main Menu' }, { label: 'Account Details' }],
	'/transactions': [{ label: 'Main Menu' }, { label: 'Transactions' }],
	'/recurrings': [{ label: 'Main Menu' }, { label: 'Recurrings' }],
	'/invoices': [{ label: 'Main Menu' }, { label: 'Invoices' }],
	'/cards': [{ label: 'Main Menu' }, { label: 'Cards' }],
	'/card-details': [{ label: 'Main Menu' }, { label: 'Card Details' }],
	'/categories': [{ label: 'Main Menu' }, { label: 'Categories' }],

	'/statistics': [{ label: 'Analytics' }, { label: 'Statistics' }],

	'/goals': [{ label: 'Planning' }, { label: 'Goals' }],
	'/goal-details': [{ label: 'Planning' }, { label: 'Goal Details' }],
	'/budgets': [{ label: 'Planning' }, { label: 'Budgets' }],

	'/settings': [{ label: 'Others' }, { label: 'Settings' }],
	'/notifications': [{ label: 'Others' }, { label: 'Notifications' }],
}

@Component({
	selector: 'app-header',
	imports: [
		Theme,
		ZardBreadcrumbComponent,
		ZardBreadcrumbItemComponent,
		LucideAngularModule,
		ProfileButton,
		ZardDividerComponent,
		NotificationPanel,
	],
	templateUrl: './header.html',
	host: {
		class: 'flex-1',
	},
})
export class Header implements OnInit {
	private readonly router = inject(Router)
	private readonly breadcrumbsService = inject(BreadcrumbService)
	private readonly destroyRef = inject(DestroyRef)
	private readonly notificationsService = inject(NotificationsService)

	readonly SlashIcon = SlashIcon

	private readonly currentUrl = toSignal(
		this.router.events.pipe(
			filter((event) => event instanceof NavigationEnd),
			map((event) => event.urlAfterRedirects),
		),
		{ initialValue: this.router.url },
	)

	readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
		const url = this.currentUrl()
		const label = this.breadcrumbsService.label()

		// to match dynamic routes by prefix
		const baseUrl = `/${url.split('/')[1]}`
		const base = BREADCRUMB_MAP[baseUrl] ??
			BREADCRUMB_MAP[url] ?? [{ label: 'Dashboard' }]

		if (label) return [...base, { label }]

		return base
	})

	ngOnInit() {
		interval(60_000)
			.pipe(
				startWith(0),
				switchMap(() => this.notificationsService.refreshUnreadCount()),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe()
	}
}
