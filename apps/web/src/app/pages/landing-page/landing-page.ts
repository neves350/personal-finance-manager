import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BentoGrid } from '@/shared/components/landing/bento-grid/bento-grid'
import { Features } from '@/shared/components/landing/features/features'
import { Footer } from '@/shared/components/landing/footer/footer'
import { Hero } from '@/shared/components/landing/hero/hero'
import { Navbar } from '@/shared/components/landing/navbar/navbar'

@Component({
	selector: 'app-landing-page',
	imports: [Navbar, Hero, Features, BentoGrid, Footer],
	templateUrl: './landing-page.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
