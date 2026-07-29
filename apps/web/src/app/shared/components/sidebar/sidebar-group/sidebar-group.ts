import { Component, computed, inject } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import {
	ArrowRightLeftIcon,
	BadgeEuroIcon,
	BellIcon,
	ChartColumnIcon,
	ChartPieIcon,
	LayoutGridIcon,
	LucideAngularModule,
	type LucideIconData,
	Repeat2Icon,
	SettingsIcon,
	TagIcon,
	WalletIcon,
} from 'lucide-angular'
import { ZardDividerComponent } from '../../ui/divider'
import {
	HlmSidebarImports,
	HlmSidebarService,
} from '../../ui/spartan/sidebar/src'

interface MenuItem {
	title: string
	url: string
	icon: LucideIconData
}

@Component({
	selector: 'app-sidebar-group',
	imports: [
		HlmSidebarImports,
		LucideAngularModule,
		RouterLink,
		RouterLinkActive,
		ZardDividerComponent,
	],
	templateUrl: './sidebar-group.html',
})
export class SidebarGroup {
	private readonly sidebarService = inject(HlmSidebarService)

	readonly isCollapsed = computed(
		() => this.sidebarService.state() === 'collapsed',
	)

	readonly activeExpandedClass =
		'text-sidebar-foreground font-medium bg-sidebar-ring/10 border-1 border-sidebar-ring/50'

	readonly activeCollapsedClass =
		'text-sidebar-foreground bg-sidebar-ring/10 border-1 border-sidebar-ring/50 font-medium rounded-md'

	readonly mainItem: MenuItem[] = [
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: LayoutGridIcon,
		},
		{
			title: 'Transactions',
			url: '/transactions',
			icon: ArrowRightLeftIcon,
		},
		{
			title: 'Recurrings',
			url: '/recurrings',
			icon: Repeat2Icon,
		},
		{
			title: 'Accounts',
			url: '/accounts',
			icon: WalletIcon,
		},
		{
			title: 'Categories',
			url: '/categories',
			icon: TagIcon,
		},
	]

	readonly analyticsItem: MenuItem[] = [
		{
			title: 'Statistics',
			url: '/statistics',
			icon: ChartColumnIcon,
		},
	]

	readonly plansItem: MenuItem[] = [
		{
			title: 'Goals',
			url: '/goals',
			icon: ChartPieIcon,
		},
		{
			title: 'Budgets',
			url: '/budgets',
			icon: BadgeEuroIcon,
		},
	]

	readonly settingsItem: MenuItem[] = [
		{
			title: 'Notifications',
			url: '/notifications',
			icon: BellIcon,
		},
		{
			title: 'System Settings',
			url: '/settings',
			icon: SettingsIcon,
		},
	]
}
