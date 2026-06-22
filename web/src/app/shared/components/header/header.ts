import { Component, computed, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router } from '@angular/router'
import { BellIcon, LucideAngularModule, SlashIcon } from 'lucide-angular'
import { filter, map } from 'rxjs'
import { BreadcrumbService } from '@/shared/services/breadcrumb.service'
import { ProfileButton } from '../profile-button/profile-button'
import { Theme } from '../theme/theme'
import {
	ZardBreadcrumbComponent,
	ZardBreadcrumbItemComponent,
} from '../ui/breadcrumb'
import { ZardButtonComponent } from '../ui/button'
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
	'/budgets': [{ label: 'Planning' }, { label: 'Budets' }],

	'/settings': [{ label: 'Others' }, { label: 'Settings' }],
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
		ZardButtonComponent,
	],
	templateUrl: './header.html',
	host: {
		class: 'flex-1',
	},
})
export class Header {
	private readonly router = inject(Router)
	private readonly breadcrumbsService = inject(BreadcrumbService)

	readonly SlashIcon = SlashIcon
	readonly BellIcon = BellIcon

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
}
