import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Column1 } from './column-1/column-1'
import { Column2 } from './column-2/column-2'
import { Column3 } from './column-3/column-3'

@Component({
	selector: 'app-bento-grid',
	imports: [Column1, Column2, Column3],
	templateUrl: './bento-grid.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BentoGrid {}
