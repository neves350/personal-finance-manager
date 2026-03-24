import { Component, inject, input, output } from '@angular/core'
import type { Category } from '@core/api/categories.interface'
import { CategoriesService } from '@core/services/categories.service'
import { LucideAngularModule, SquarePenIcon, Trash2Icon } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardCardComponent } from '../../ui/card'
import { ZardDialogService } from '../../ui/dialog'
import { CATEGORY_ICON_MAP } from '../category-icons'

@Component({
	selector: 'app-categories-list',
	imports: [
		ZardCardComponent,
		ZardButtonComponent,
		LucideAngularModule,
		ZardBadgeComponent,
	],
	templateUrl: './categories-list.html',
})
export class CategoriesList {
	readonly categories = input.required<Category[]>()
	readonly title = input.required<string>()
	readonly dotColor = input<string>('bg-destructive')
	readonly iconMap = CATEGORY_ICON_MAP

	readonly edit = output<Category>()

	private readonly dialogService = inject(ZardDialogService)
	private readonly categoriesService = inject(CategoriesService)

	readonly SquarePenIcon = SquarePenIcon
	readonly Trash2Icon = Trash2Icon

	editCategory(category: Category) {
		this.edit.emit(category)
	}

	deleteCategory(category: Category) {
		const categoryId = category.id
		if (!categoryId) return

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
