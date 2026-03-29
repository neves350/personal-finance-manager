import { ChangeDetectionStrategy, Component, output } from '@angular/core'
import {
	LandmarkIcon,
	LucideAngularModule,
	PencilIcon,
	SparklesIcon,
} from 'lucide-angular'

@Component({
	selector: 'app-account-dialog',
	imports: [LucideAngularModule],
	templateUrl: './account-dialog.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDialog {
	readonly selectAutomatic = output<void>()
	readonly selectManual = output<void>()

	readonly LandmarkIcon = LandmarkIcon
	readonly PencilIcon = PencilIcon
	readonly SparklesIcon = SparklesIcon
}
