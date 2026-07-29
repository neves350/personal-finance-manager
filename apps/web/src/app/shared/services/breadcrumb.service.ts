import { Injectable, signal } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
	readonly label = signal<string | null>(null)

	set(label: string) {
		this.label.set(label)
	}

	clear() {
		this.label.set(null)
	}
}
