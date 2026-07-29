import {
	ChangeDetectionStrategy,
	Component,
	inject,
	TemplateRef,
	ViewContainerRef,
	viewChild,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideAngularModule, MenuIcon } from 'lucide-angular'
import { ZardButtonComponent } from '../../ui/button'
import { ZardSheetService } from '../../ui/sheet'

@Component({
	selector: 'app-navbar',
	imports: [RouterLink, LucideAngularModule, ZardButtonComponent],
	templateUrl: './navbar.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
	private readonly sheetService = inject(ZardSheetService)
	private readonly vcr = inject(ViewContainerRef)

	readonly menuContent = viewChild.required<TemplateRef<void>>('menuContent')

	readonly MenuIcon = MenuIcon

	openMenu(): void {
		this.sheetService.create({
			zTitle: 'Explore',
			zDescription: 'Explore the features and how it works.',
			zContent: this.menuContent(),
			zViewContainerRef: this.vcr,
			zSide: 'right',
			zHideFooter: true,
			zMaskClosable: true,
		})
	}
}
