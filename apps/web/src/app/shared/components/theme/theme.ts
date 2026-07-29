import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { LucideAngularModule, MoonIcon, SunIcon } from 'lucide-angular'
import { ZardDarkMode } from '@/shared/services/dark-mode'
import { ZardButtonComponent } from '../ui/button'

@Component({
	selector: 'app-theme',
	imports: [ZardButtonComponent, LucideAngularModule],
	templateUrl: './theme.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Theme {
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
