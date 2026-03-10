import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { AuthService } from '@core/services/auth/auth.service'
import { UsersService } from '@core/services/users.service'
import { PasswordChecklist } from '@pages/auth/register/password-checklist'
import { EyeIcon, EyeOffIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { map, startWith } from 'rxjs'
import { ZardButtonComponent } from '../../ui/button'
import { ZardInputDirective } from '../../ui/input'
import { ZardLoaderComponent } from '../../ui/loader'

@Component({
	selector: 'app-settings-security',
	imports: [
		ZardInputDirective,
		ZardButtonComponent,
		ReactiveFormsModule,
		LucideAngularModule,
		PasswordChecklist,
		ZardLoaderComponent,
	],
	templateUrl: './settings-security.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSecurity {
	private readonly fb = inject(FormBuilder)
	private readonly usersService = inject(UsersService)
	private readonly authService = inject(AuthService)

	readonly EyeIcon = EyeIcon
	readonly EyeOffIcon = EyeOffIcon

	form = this.fb.nonNullable.group({
		currentPassword: ['', [Validators.required]],
		newPassword: [
			'',
			[
				Validators.required,
				Validators.minLength(6),
				Validators.pattern(/\d/),
				Validators.pattern(/[a-z]/),
				Validators.pattern(/[A-Z]/),
				Validators.pattern(/[^\w\s]/),
			],
		],
		confirmPassword: ['', [Validators.required]],
	})

	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	readonly hasChanges = computed(() => {
		const { currentPassword, newPassword, confirmPassword } = this.formValues()
		return (
			currentPassword !== '' || newPassword !== '' || confirmPassword !== ''
		)
	})

	readonly passwordFocused = signal(false)
	readonly showCurrentPassword = signal(false)
	readonly showNewPassword = signal(false)
	readonly showConfirmPassword = signal(false)
	readonly submitting = signal(false)

	toggleCurrentPassword() {
		this.showCurrentPassword.update((v) => !v)
	}

	toggleNewPassword() {
		this.showNewPassword.update((v) => !v)
	}

	toggleConfirmPassword() {
		this.showConfirmPassword.update((v) => !v)
	}

	readonly passwordValue = toSignal(
		this.form.controls.newPassword.valueChanges.pipe(
			startWith(''),
			map((v) => v ?? ''),
		),
		{ initialValue: '' },
	)

	passwordsMatch(): boolean {
		const { newPassword, confirmPassword } = this.form.controls
		return newPassword.value === confirmPassword.value
	}

	isFormValid(): boolean {
		return this.form.valid && this.passwordsMatch()
	}

	submit() {
		if (!this.isFormValid()) {
			this.form.markAllAsTouched()
			return
		}

		const userId = this.authService.currentUser()?.id
		if (!userId) return

		this.submitting.set(true)

		const { currentPassword, newPassword, confirmPassword } =
			this.form.getRawValue()

		this.usersService
			.changePassword(userId, {
				currentPassword,
				newPassword,
				confirmPassword,
			})
			.subscribe({
				next: (message) => {
					toast.success(message)
					this.form.reset()
					this.submitting.set(false)
				},
				error: (error) => {
					toast.error(error.error?.message || 'Failed to change password')
					this.submitting.set(false)
				},
			})
	}
}
