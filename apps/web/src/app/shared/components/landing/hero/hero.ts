import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-hero',
	imports: [RouterLink],
	templateUrl: './hero.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}
