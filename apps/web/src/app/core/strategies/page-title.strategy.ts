import { Injectable, inject } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router'

@Injectable()
export class PageTitleStrategy extends TitleStrategy {
	private readonly title = inject(Title)

	override updateTitle(snapshot: RouterStateSnapshot): void {
		const title = this.buildTitle(snapshot)
		this.title.setTitle(title ? `${title} | Trocos` : 'Trocos')
	}
}
