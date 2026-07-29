import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	input,
	signal,
} from '@angular/core'
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { CardColor } from '@core/api/cards.interface'
import { CheckIcon, LucideAngularModule } from 'lucide-angular'

@Component({
	selector: 'app-cards-color-picker',
	imports: [LucideAngularModule],
	templateUrl: './cards-color-picker.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CardsColorPicker),
			multi: true,
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsColorPicker implements ControlValueAccessor {
	readonly colors = input.required<CardColor[]>()

	protected readonly selectedColor = signal<CardColor>(CardColor.GRAY)
	protected readonly CheckIcon = CheckIcon

	private onChange: (value: CardColor) => void = () => {}
	private onTouched: () => void = () => {}

	private readonly colorClasses: Record<CardColor, string> = {
		[CardColor.GRAY]: 'bg-zinc-500 transition-transform hover:scale-110',
		[CardColor.PURPLE]: 'bg-chart-3 transition-transform hover:scale-110',
		[CardColor.BLUE]: 'bg-chart-2 transition-transform hover:scale-110',
		[CardColor.GREEN]: 'bg-primary transition-transform hover:scale-110',
		[CardColor.YELLOW]: 'bg-amber-300 transition-transform hover:scale-110',
		[CardColor.ORANGE]: 'bg-chart-4 transition-transform hover:scale-110',
		[CardColor.RED]: 'bg-chart-5 transition-transform hover:scale-110',
		[CardColor.PINK]: 'bg-chart-6 transition-transform hover:scale-110',
	}

	getButtonClasses(color: CardColor): string {
		const base =
			'size-8 rounded-full flex items-center justify-center transition-all cursor-pointer'
		const selected =
			this.selectedColor() === color ? 'ring-2 ring-offset-2 ring-border' : ''
		return `${base} ${this.colorClasses[color]} ${selected}`
	}

	selectColor(color: CardColor): void {
		this.selectedColor.set(color)
		this.onChange(color)
		this.onTouched()
	}

	isSelected(color: CardColor): boolean {
		return this.selectedColor() === color
	}

	writeValue(value: CardColor): void {
		if (value) {
			this.selectedColor.set(value)
		}
	}

	registerOnChange(fn: (value: CardColor) => void): void {
		this.onChange = fn
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn
	}
}
