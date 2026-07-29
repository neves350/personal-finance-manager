import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
	selector: 'app-hero',
	imports: [],
	templateUrl: './hero.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}
