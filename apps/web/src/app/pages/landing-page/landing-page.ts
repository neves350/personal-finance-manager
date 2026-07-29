import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Navbar } from '@/shared/components/landing/navbar/navbar'

@Component({
	selector: 'app-landing-page',
	imports: [Navbar],
	templateUrl: './landing-page.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
