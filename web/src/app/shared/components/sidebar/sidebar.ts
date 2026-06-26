import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ZardAvatarComponent } from '../ui/avatar'
import { ZardButtonComponent } from '../ui/button'
import { ZardDividerComponent } from '../ui/divider'
import { HlmSidebarImports } from '../ui/spartan/sidebar/src'
import { SidebarGroup } from './sidebar-group/sidebar-group'
import { SidebarProfile } from './sidebar-profile/sidebar-profile'

@Component({
	selector: 'app-sidebar',
	imports: [
		ZardAvatarComponent,
		HlmSidebarImports,
		ZardDividerComponent,
		SidebarGroup,
		SidebarProfile,
		ZardButtonComponent,
		RouterLink,
	],
	templateUrl: './sidebar.html',
})
export class Sidebar {}
