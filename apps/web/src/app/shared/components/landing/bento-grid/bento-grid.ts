import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Column1 } from './column-1/column-1'

@Component({
	selector: 'app-bento-grid',
	imports: [Column1],
	templateUrl: './bento-grid.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BentoGrid {}
