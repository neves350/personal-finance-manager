import { NgOptimizedImage } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

interface GalleryCard {
	image: string
	alt: string
	title: string
	description: string
}

@Component({
	selector: 'app-gallery',
	imports: [NgOptimizedImage],
	templateUrl: './gallery.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
	protected readonly cards: GalleryCard[] = [
		{
			image: 'transactions.png',
			alt: 'Transactions',
			title: 'Transactions',
			description: '- every movement, grouped by day.',
		},
		{
			image: 'budgets.png',
			alt: 'Budgets',
			title: 'Budgets',
			description: '- envelopes with live status.',
		},
		{
			image: 'goals.png',
			alt: 'Goals',
			title: 'Goals',
			description: "- save toward what's next.",
		},
		{
			image: 'accounts.png',
			alt: 'Accounts',
			title: 'Accounts',
			description: '- cards and banks, totalled.',
		},
	]
}
