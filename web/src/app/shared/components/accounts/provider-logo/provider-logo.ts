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
			'#3B82F6',
			'#10B981',
			'#8B5CF6',
			'#F59E0B',
			'#EF4444',
			'#06B6D4',
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
