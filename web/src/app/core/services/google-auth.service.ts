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

			google.accounts.id.prompt((notification) => {
				if (notification.isSkippedMoment() || notification.isNotDisplayed()) {
					this.ngZone.run(() => {
						subscriber.error(
							new Error(
								notification.isNotDisplayed()
									? notification.getNotDisplayedReason()
									: notification.getSkippedReason(),
							),
						)
					})
				}
			})
		})
	}
}
