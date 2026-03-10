import { Component, inject } from '@angular/core'
import { LucideAngularModule, MoonIcon, SunIcon } from 'lucide-angular'
import { ZardDarkMode } from '@/shared/services/dark-mode'
import { ZardSwitchComponent } from '../../ui/switch'

@Component({
	selector: 'app-settings-appearance',
	imports: [ZardSwitchComponent, LucideAngularModule],
	templateUrl: './settings-appearance.html',
})
export class SettingsAppearance {
	darkMode = localStorage.getItem('theme') === 'dark'

	private readonly darkModeService = inject(ZardDarkMode)

	readonly SunIcon = SunIcon
	readonly MoonIcon = MoonIcon

	toggleTheme() {
		this.darkMode = !this.darkMode
		localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
		this.darkModeService.toggleTheme()
	}
}
