import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Features } from '@/shared/components/landing/features/features'
import { Hero } from '@/shared/components/landing/hero/hero'
import { Navbar } from '@/shared/components/landing/navbar/navbar'

@Component({
	selector: 'app-landing-page',
	imports: [Navbar, Hero, Features],
	templateUrl: './landing-page.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
