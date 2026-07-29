import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Features } from '@/shared/components/landing/features/features'
import { Gallery } from '@/shared/components/landing/gallery/gallery'
import { Hero } from '@/shared/components/landing/hero/hero'
import { HowWorks } from '@/shared/components/landing/how-works/how-works'
import { Navbar } from '@/shared/components/landing/navbar/navbar'

@Component({
	selector: 'app-landing-page',
	imports: [Navbar, Hero, Features, HowWorks, Gallery],
	templateUrl: './landing-page.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
