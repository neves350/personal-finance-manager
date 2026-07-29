import { Component } from '@angular/core'
import { PageHeader } from '@/shared/components/page-header/page-header'
import { SettingsAppearance } from '@/shared/components/settings/settings-appearance/settings-appearance'
import { SettingsProfile } from '@/shared/components/settings/settings-profile/settings-profile'
import { SettingsSecurity } from '@/shared/components/settings/settings-security/settings-security'
import { ZardCardComponent } from '@/shared/components/ui/card'

@Component({
	selector: 'app-settings',
	imports: [
		SettingsProfile,
		ZardCardComponent,
		SettingsSecurity,
		SettingsAppearance,
		PageHeader,
	],
	templateUrl: './settings.html',
})
export class Settings {}
