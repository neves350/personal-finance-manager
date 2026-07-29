import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Header } from '../header/header'
import { Sidebar } from '../sidebar/sidebar'
import { HlmSidebarImports } from '../ui/spartan/sidebar/src'

@Component({
	selector: 'app-layout',
	imports: [Header, RouterOutlet, Sidebar, HlmSidebarImports],
	templateUrl: './layout.html',
})
export class Layout {}
