import { Injectable, inject, NgZone } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

@Injectable({
	providedIn: 'root',
})
export class GoogleAuthService {
	private readonly ngZone = inject(NgZone)

	signIn(): Observable<string> {
		return new Observable<string>((subscriber) => {
			google.accounts.id.initialize({
				client_id: environment.googleClientId,
				callback: (response) => {
					this.ngZone.run(() => {
						subscriber.next(response.credential)
						subscriber.complete()
					})
				},
			})

			const container = document.createElement('div')
			container.style.display = 'none'
			document.body.appendChild(container)

			google.accounts.id.renderButton(container, {
				type: 'icon',
				size: 'large',
			})

			const googleBtn = container.querySelector<HTMLElement>('[role="button"]')
			if (googleBtn) {
				googleBtn.click()
			}

			return () => container.remove()
		})
	}
}
