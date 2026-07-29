import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	signal,
} from '@angular/core'
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { CheckIcon, LucideAngularModule } from 'lucide-angular'

export const CATEGORY_COLORS = [
	'oklch(0.723 0.219 142.5)',
	'oklch(0.623 0.214 259.1)',
	'oklch(0.769 0.188 70.1)',
	'oklch(0.718 0.202 349.8)',
	'oklch(0.704 0.14 182.5)',
	'oklch(0.705 0.191 47.6)',
	'oklch(0.606 0.224 292.6)',
	'oklch(0.628 0.257 29.2)',
	'oklch(0.715 0.143 215.3)',
	'oklch(0.627 0.265 303.9)',
	'oklch(0.726 0.177 162.1)',
	'oklch(0.645 0.246 16.4)',
	'oklch(0.585 0.233 277.1)',
	'oklch(0.555 0.011 286.1)',
]

@Component({
	selector: 'app-category-color-picker',
	imports: [LucideAngularModule],
	templateUrl: './category-color-picker.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CategoryColorPicker),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryColorPicker implements ControlValueAccessor {
	readonly colors = CATEGORY_COLORS
	readonly CheckIcon = CheckIcon

	readonly selectedColor = signal<string>(CATEGORY_COLORS[0])

	private onChange: (value: string) => void = () => {}
	private onTouched: () => void = () => {}

	selectColor(color: string): void {
		this.selectedColor.set(color)
		this.onChange(color)
		this.onTouched()
	}

	isSelected(color: string): boolean {
		return this.selectedColor() === color
	}

	writeValue(value: string): void {
		if (value) this.selectedColor.set(value)
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn
	}
}
