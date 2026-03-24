import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { LucideAngularModule, MoonIcon, SunIcon } from 'lucide-angular'
import { EDarkModes, ZardDarkMode } from '@/shared/services/dark-mode'
import { ZardSwitchComponent } from '../../ui/switch'

@Component({
	selector: 'app-settings-appearance',
	imports: [ZardSwitchComponent, LucideAngularModule],
	templateUrl: './settings-appearance.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAppearance {
	private readonly darkModeService = inject(ZardDarkMode)

	readonly darkMode = computed(
		() => this.darkModeService.themeMode() === EDarkModes.DARK,
	)

	readonly SunIcon = SunIcon
	readonly MoonIcon = MoonIcon

	toggleTheme() {
		this.darkModeService.toggleTheme()
	}
}
