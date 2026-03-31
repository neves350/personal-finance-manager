import {
	ChangeDetectionStrategy,
	Component,
	computed,
	forwardRef,
	signal,
} from '@angular/core'
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { LucideAngularModule } from 'lucide-angular'
import { CATEGORY_ICON_MAP, CATEGORY_ICON_NAMES } from '../category-icons'

const PREVIEW_COUNT = 11

@Component({
	selector: 'app-icon-picker',
	imports: [LucideAngularModule],
	templateUrl: './icon-picker.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => IconPicker),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPicker implements ControlValueAccessor {
	readonly iconMap = CATEGORY_ICON_MAP
	readonly total = CATEGORY_ICON_NAMES.length
	readonly totalLabel = `${CATEGORY_ICON_NAMES.length} total`

	protected readonly selectedIcon = signal<string>('')
	protected readonly expanded = signal(false)

	protected readonly visibleIcons = computed(() =>
		this.expanded()
			? CATEGORY_ICON_NAMES
			: CATEGORY_ICON_NAMES.slice(0, PREVIEW_COUNT),
	)

	private onChange: (value: string) => void = () => {}
	private onTouched: () => void = () => {}

	selectIcon(icon: string): void {
		this.selectedIcon.set(icon)
		this.onChange(icon)
		this.onTouched()
	}

	toggleExpanded(): void {
		this.expanded.update((v) => !v)
	}

	getIconClasses(icon: string): string {
		const base =
			'flex items-center justify-center p-2 rounded-md border cursor-pointer transition-colors'
		return this.selectedIcon() === icon
			? `${base} border-primary bg-primary/10`
			: `${base} border-transparent hover:bg-accent`
	}

	writeValue(value: string): void {
		this.selectedIcon.set(value ?? '')
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn
	}
}
