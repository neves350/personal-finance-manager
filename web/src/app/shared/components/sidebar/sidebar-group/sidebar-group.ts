import { Component, computed, inject } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import {
	ArrowRightLeftIcon,
	ChartPieIcon,
	FileChartLineIcon,
	LayoutGridIcon,
	LucideAngularModule,
	type LucideIconData,
	Repeat2Icon,
	ScrollTextIcon,
	SettingsIcon,
	TagIcon,
	WalletCardsIcon,
	WalletMinimalIcon,
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
		'text-sidebar-foreground font-medium bg-sidebar-accent pl-2'

	readonly activeCollapsedClass =
		'text-sidebar-foreground bg-sidebar-accent font-medium rounded-md'

	readonly mainItem: MenuItem[] = [
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: LayoutGridIcon,
		},
		{
			title: 'Accounts',
			url: '/accounts',
			icon: WalletMinimalIcon,
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
			title: 'Invoices',
			url: '/invoices',
			icon: ScrollTextIcon,
		},
		{
			title: 'Cards',
			url: '/cards',
			icon: WalletCardsIcon,
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
			icon: FileChartLineIcon,
		},
	]

	readonly plansItem: MenuItem[] = [
		{
			title: 'Goals',
			url: '/goals',
			icon: ChartPieIcon,
		},
	]

	readonly othersItem: MenuItem[] = [
		{
			title: 'Settings',
			url: '/settings',
			icon: SettingsIcon,
		},
	]
}
