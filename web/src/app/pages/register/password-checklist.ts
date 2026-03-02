import {
	ChangeDetectionStrategy,
	Component,
	computed,
	input,
} from '@angular/core'
import { CheckIcon, LucideAngularModule, XIcon } from 'lucide-angular'
import { ZardProgressBarComponent } from '@/shared/components/ui/progress-bar'

@Component({
	selector: 'app-password-checklist',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [LucideAngularModule, ZardProgressBarComponent],
	template: `
		<z-progress-bar
			[progress]="strength()"
			class="mt-4 h-1.5"
		/>

		<p class="text-sm text-muted-foreground mt-3">
			Enter a password. Must contain:
		</p>

		<ul class="mt-2 space-y-1.5">
			@for (rule of rules(); track rule.label) {
				<li class="flex items-center gap-2 text-sm">
					<i-lucide
						[img]="rule.met ? CheckIcon : XIcon"
						[class]="
							rule.met
								? 'size-4 text-primary'
								: 'size-4 text-muted-foreground/50'
						"
					/>
					<span
						[class]="
							rule.met
								? 'text-primary'
								: 'text-muted-foreground/50'
						"
						>{{ rule.label }}</span
					>
				</li>
			}
		</ul>
	`,
})
export class PasswordChecklist {
	readonly password = input.required<string>()

	readonly CheckIcon = CheckIcon
	readonly XIcon = XIcon

	readonly hasMinLength = computed(() => this.password().length >= 6)
	readonly hasNumber = computed(() => /\d/.test(this.password()))
	readonly hasLowercase = computed(() => /[a-z]/.test(this.password()))
	readonly hasUppercase = computed(() => /[A-Z]/.test(this.password()))
	readonly hasSymbol = computed(() => /[^\w\s]/.test(this.password()))

	readonly rules = computed(() => [
		{ label: 'At least 6 characters', met: this.hasMinLength() },
		{ label: 'At least 1 number', met: this.hasNumber() },
		{
			label: 'At least 1 lowercase letter',
			met: this.hasLowercase(),
		},
		{
			label: 'At least 1 uppercase letter',
			met: this.hasUppercase(),
		},
		{
			label: 'At least 1 symbol (!@#$...)',
			met: this.hasSymbol(),
		},
	])

	readonly strength = computed(() => {
		let score = 0
		if (this.hasMinLength()) score += 20
		if (this.hasNumber()) score += 20
		if (this.hasLowercase()) score += 20
		if (this.hasUppercase()) score += 20
		if (this.hasSymbol()) score += 20
		return score
	})
}
