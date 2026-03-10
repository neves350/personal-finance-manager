import { Component } from '@angular/core'
import { SettingsAppearance } from '@/shared/components/settings/settings-appearance/settings-appearance'
import { SettingsProfile } from '@/shared/components/settings/settings-profile/settings-profile'
import { SettingsSecurity } from '@/shared/components/settings/settings-security/settings-security'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'

@Component({
	selector: 'app-settings',
	imports: [
		SettingsProfile,
		ZardCardComponent,
		ZardDividerComponent,
		SettingsSecurity,
		SettingsAppearance,
	],
	templateUrl: './settings.html',
})
export class Settings {}
