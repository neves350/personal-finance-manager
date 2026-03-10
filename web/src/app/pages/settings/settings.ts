import { Component } from '@angular/core'
import { SettingsProfile } from '@/shared/components/settings/settings-profile/settings-profile'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDividerComponent } from '@/shared/components/ui/divider'

@Component({
	selector: 'app-settings',
	imports: [SettingsProfile, ZardCardComponent, ZardDividerComponent],
	templateUrl: './settings.html',
})
export class Settings {}
