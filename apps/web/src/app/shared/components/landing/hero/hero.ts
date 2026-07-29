import { NgOptimizedImage } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
	selector: 'app-hero',
	imports: [RouterLink, NgOptimizedImage],
	templateUrl: './hero.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}
