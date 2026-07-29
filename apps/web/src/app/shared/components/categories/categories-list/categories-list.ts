import { TitleCasePipe } from '@angular/common'
import { Component, inject, input } from '@angular/core'
import type { Category } from '@core/api/categories.interface'
import { CategoriesService } from '@core/services/categories.service'
import { LucideAngularModule, SquarePenIcon, Trash2Icon } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { ZardSheetService } from '../../ui/sheet'
import { CategoriesForm } from '../categories-form/categories-form'
import type { iCategorySheetData } from '../categories-form/categories-form.interface'
import { CATEGORY_ICON_MAP } from '../category-icons'

@Component({
	selector: 'app-categories-list',
	imports: [
		ZardCardComponent,
		ZardButtonComponent,
		LucideAngularModule,
		ZardBadgeComponent,
		TitleCasePipe,
	],
	templateUrl: './categories-list.html',
})
export class CategoriesList {
	readonly categories = input.required<Category[]>()
	// readonly title = input.required<string>()
	// readonly dotColor = input<string>('bg-destructive')
	readonly iconMap = CATEGORY_ICON_MAP

	private readonly dialogService = inject(ZardDialogService)
	private readonly sheetService = inject(ZardSheetService)
	private readonly categoriesService = inject(CategoriesService)

	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon

	editCategory(category: Category) {
		this.sheetService.create({
			zTitle: 'Edit Category',
			zContent: CategoriesForm,
			zWidth: '500px',
			zSide: 'right',
			zHideFooter: false,
			zOkText: 'Save Changes',
			zOnOk: (instance: CategoriesForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'sm:rounded-l-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
			zData: {
				id: category.id,
				title: category.title,
				icon: category.icon,
				color: category.color,
				type: category.type,
			} as iCategorySheetData,
		})
	}

	deleteCategory(category: Category) {
		const categoryId = category.id
		if (!categoryId) return
		if (category.isDefault) return

		return this.dialogService.create({
			zTitle: `Remove category`,
			zDescription: `Are you sure you want to delete the recurring entry "${category.title}"? This action cannot be undone.`,
			zCancelText: 'Cancel',
			zOkText: 'Delete Category',
			zOkDestructive: true,
			zWidth: '500px',
			zOnOk: async () => {
				try {
					const message = await lastValueFrom(
						this.categoriesService.delete(categoryId),
					)
					toast.success(message)
					this.categoriesService.loadCategories().subscribe()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to delete category')
					return false
				}
			},
		})
	}
}
