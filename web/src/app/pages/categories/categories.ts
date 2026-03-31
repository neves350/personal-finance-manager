import { Component, inject, type OnInit } from '@angular/core'
import { CategoriesService } from '@core/services/categories.service'
import { LucideAngularModule, PlusIcon } from 'lucide-angular'
import { CategoriesForm } from '@/shared/components/categories/categories-form/categories-form'
import { CategoriesList } from '@/shared/components/categories/categories-list/categories-list'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'
import { ZardSheetService } from '@/shared/components/ui/sheet'
import {
	ZardTabComponent,
	ZardTabGroupComponent,
} from '@/shared/components/ui/tabs'

@Component({
	selector: 'app-categories',
	imports: [
		CategoriesList,
		ZardButtonComponent,
		LucideAngularModule,
		ZardLoaderComponent,
		ZardTabGroupComponent,
		ZardTabComponent,
	],
	templateUrl: './categories.html',
})
export class Categories implements OnInit {
	readonly PlusIcon = PlusIcon

	private readonly categoriesService = inject(CategoriesService)
	private readonly sheetService = inject(ZardSheetService)

	readonly categories = this.categoriesService.categories
	readonly isLoading = this.categoriesService.loading
	readonly expenseCategories = this.categoriesService.expenseCategories
	readonly incomeCategories = this.categoriesService.incomeCategories

	ngOnInit(): void {
		this.categoriesService.loadCategories().subscribe()
	}

	addCategory() {
		this.sheetService.create({
			zTitle: 'New Category',
			zContent: CategoriesForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Create Category',
			zOnOk: (instance: CategoriesForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
