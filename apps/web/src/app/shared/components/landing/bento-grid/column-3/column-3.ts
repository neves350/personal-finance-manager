import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
	BotIcon,
	LightbulbIcon,
	LucideAngularModule,
	SparkleIcon,
} from 'lucide-angular'

interface AutomationToggle {
	label: string
	enabled: boolean
}

@Component({
	selector: 'app-column-3',
	imports: [LucideAngularModule],
	templateUrl: './column-3.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Column3 {
	readonly BotIcon = BotIcon
	readonly SparkleIcon = SparkleIcon
	readonly LightbulbIcon = LightbulbIcon

	readonly automationToggles: AutomationToggle[] = [
		{ label: 'Auto-categorize transactions', enabled: true },
		{ label: 'Detect recurring bills', enabled: true },
		{ label: 'Budget overspend alerts', enabled: false },
		{ label: 'Weekly digest email', enabled: false },
	]

	readonly insightTip =
		"You're saving more than 50% of your income this period."
}
