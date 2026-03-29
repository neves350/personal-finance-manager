import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
	signal,
} from '@angular/core'

@Component({
	selector: 'app-provider-logo',
	imports: [],
	templateUrl: './provider-logo.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderLogo {
	readonly logoUrl = input<string | null | undefined>()
	readonly providerName = input.required<string>()

	readonly imgError = signal(false)

	readonly fallback = computed(() => {
		const name = this.providerName()
		const colors = [
			'bg-chart-1',
			'bg-chart-2',
			'bg-chart-3',
			'bg-chart-4',
			'bg-chart-5',
			'bg-chart-6',
		]
		const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
		const initials = name
			.split(' ')
			.slice(0, 2)
			.map((w: string) => w[0])
			.join('')
			.toUpperCase()

		return {
			color: colors[hash % colors.length],
			initials,
		}
	})
}
