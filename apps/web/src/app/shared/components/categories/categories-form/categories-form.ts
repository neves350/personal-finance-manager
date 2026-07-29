import {
	Component,
	computed,
	inject,
	input,
	type OnInit,
	output,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import type { Category } from '@core/api/categories.interface'
import { CategoryType } from '@core/api/categories.interface'
import { CategoriesService } from '@core/services/categories.service'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CirclePlusIcon,
	LucideAngularModule,
	type LucideIconData,
	SaveIcon,
	XIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardDividerComponent } from '../../ui/divider'
import { ZardInputDirective } from '../../ui/input'
import { Z_SHEET_DATA, ZardSheetRef } from '../../ui/sheet'
import { CategoryColorPicker } from '../category-color-picker/category-color-picker'
import { CATEGORY_ICON_NAMES } from '../category-icons'
import { IconPicker } from '../icon-picker/icon-picker'
import type { iCategorySheetData } from './categories-form.interface'

@Component({
	selector: 'app-categories-form',
	imports: [
		ReactiveFormsModule,
		ZardBadgeComponent,
		IconPicker,
		LucideAngularModule,
		ZardInputDirective,
		ZardDividerComponent,
		CategoryColorPicker,
	],
	templateUrl: './categories-form.html',
})
export class CategoriesForm implements OnInit {
	private readonly fb = inject(FormBuilder)
	private readonly categoriesService = inject(CategoriesService)
	private readonly zData: iCategorySheetData = inject(Z_SHEET_DATA)
	private readonly sheetRef = inject(ZardSheetRef)

	readonly category = input<Category | null>(null)
	readonly editDone = output<void>()

	readonly CirclePlusIcon = CirclePlusIcon
	readonly SaveIcon = SaveIcon
	readonly XIcon = XIcon
	readonly totalIconsLabel = `${CATEGORY_ICON_NAMES.length} total`

	form = this.fb.nonNullable.group({
		title: ['', [Validators.required]],
		icon: ['', [Validators.required]],
		color: [''],
		type: [CategoryType.EXPENSE, [Validators.required]],
	})

	readonly isEditMode = computed(() => !!this.zData?.id)
	readonly categoryTypes = Object.values(CategoryType)

	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	readonly previewData = computed(() => ({
		title: this.formValues()?.title || 'Category Title',
		icon: this.formValues().icon || '',
		color: this.formValues()?.color || '',
		type: this.formValues()?.type || CategoryType.EXPENSE,
	}))

	readonly typeLabels: Record<CategoryType, string> = {
		[CategoryType.EXPENSE]: 'Expenses',
		[CategoryType.INCOME]: 'Income',
	}

	getTypeLabel(type: CategoryType): string {
		return this.typeLabels[type]
	}

	readonly typeIcons: Record<CategoryType, LucideIconData> = {
		[CategoryType.EXPENSE]: ArrowDownIcon,
		[CategoryType.INCOME]: ArrowUpIcon,
	}

	selectType(type: CategoryType): void {
		this.form.controls.type.setValue(type)
	}

	getTypeClasses(categoryType: CategoryType): string {
		const isSelected = this.form.controls.type.value === categoryType

		if (!isSelected) return 'border-input'

		return categoryType === CategoryType.INCOME
			? 'border-primary bg-primary/20'
			: 'border-destructive bg-destructive/20'
	}

	getTypeIconClasses(categoryType: CategoryType): string {
		const isSelected = this.form.controls.type.value === categoryType

		if (!isSelected) return 'text-foreground'

		return categoryType === CategoryType.INCOME
			? 'text-primary'
			: 'text-destructive'
	}

	ngOnInit(): void {
		if (this.zData?.id) {
			this.form.patchValue({
				title: this.zData.title ?? '',
				icon: this.zData.icon ?? '',
				color: this.zData.color ?? '',
				type: this.zData.type ?? CategoryType.EXPENSE,
			})
		}
	}

	submit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched()
			return
		}

		const formValue = this.form.getRawValue()
		const payload = {
			title: formValue.title,
			icon: formValue.icon,
			color: formValue.color,
			type: formValue.type,
		}

		const categoryId = this.category()?.id
		const request$ = categoryId
			? this.categoriesService.update(categoryId, payload)
			: this.categoriesService.create(payload)

		const action = this.isEditMode() ? 'updated' : 'created'

		request$.subscribe({
			next: () => {
				toast.success(`Category ${action} successfully`)
				this.sheetRef.close()
			},
			error: () => {
				toast.error(
					`Failed to ${this.isEditMode() ? 'update' : 'create'} category`,
				)
			},
		})
	}
}
