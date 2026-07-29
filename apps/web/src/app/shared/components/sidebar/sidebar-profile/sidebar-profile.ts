import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import {
	BadgeCheckIcon,
	BellIcon,
	ChevronsUpDownIcon,
	CreditCardIcon,
	LogOutIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { ZardAvatarComponent } from '../../ui/avatar'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardDropdownImports } from '../../ui/dropdown'
import { HlmSidebarImports } from '../../ui/spartan/sidebar/src'
import { HlmSidebarService } from '../../ui/spartan/sidebar/src/lib/hlm-sidebar.service'

@Component({
	selector: 'app-sidebar-profile',
	imports: [
		HlmSidebarImports,
		ZardDropdownImports,
		ZardAvatarComponent,
		ZardDividerComponent,
		LucideAngularModule,
		RouterLink,
	],
	templateUrl: './sidebar-profile.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarProfile {
	private readonly authService = inject(AuthService)
	private readonly sidebarService = inject(HlmSidebarService)

	readonly user = this.authService.currentUser

	readonly isCollapsed = computed(
		() => this.sidebarService.state() === 'collapsed',
	)

	readonly initials = computed(() => {
		const name = this.user()?.name
		if (!name) return ''
		return name
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('')
	})

	readonly ChevronsUpDownIcon = ChevronsUpDownIcon
	readonly BadgeCheckIcon = BadgeCheckIcon
	readonly CreditCardIcon = CreditCardIcon
	readonly BellIcon = BellIcon
	readonly LogOutIcon = LogOutIcon

	logout() {
		this.authService.logout()
	}
}
