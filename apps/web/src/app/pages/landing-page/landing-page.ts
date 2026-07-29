import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Hero } from '@/shared/components/landing/hero/hero'
import { Navbar } from '@/shared/components/landing/navbar/navbar'

@Component({
	selector: 'app-landing-page',
	imports: [Navbar, Hero],
	templateUrl: './landing-page.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
