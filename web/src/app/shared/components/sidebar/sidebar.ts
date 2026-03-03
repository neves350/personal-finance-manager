import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, UserLockIcon } from 'lucide-angular'
import { ZardAvatarComponent } from '../ui/avatar'
import { ZardButtonComponent } from '../ui/button'
import { ZardCardComponent } from '../ui/card'
import { ZardDividerComponent } from '../ui/divider'
import { HlmSidebarImports } from '../ui/spartan/sidebar/src'
import { SidebarGroup } from './sidebar-group/sidebar-group'

@Component({
	selector: 'app-sidebar',
	imports: [
		ZardAvatarComponent,
		HlmSidebarImports,
		ZardDividerComponent,
		SidebarGroup,
		ZardButtonComponent,
		RouterLink,
		ZardCardComponent,
		LucideAngularModule,
	],
	templateUrl: './sidebar.html',
})
export class Sidebar {
	readonly UserLockIcon = UserLockIcon
}
