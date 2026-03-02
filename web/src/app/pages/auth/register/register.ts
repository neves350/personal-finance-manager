import {
	ChangeDetectionStrategy,
	Component,
	inject,
	signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import { GoogleAuthService } from '@core/services/google-auth.service'
import {
	ArrowRightIcon,
	EyeIcon,
	EyeOffIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { map, startWith, switchMap } from 'rxjs'
import { ZardAvatarComponent } from '@/shared/components/ui/avatar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardInputDirective } from '@/shared/components/ui/input'
import { PasswordChecklist } from './password-checklist'

@Component({
	selector: 'app-register',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		RouterLink,
		ZardAvatarComponent,
		ZardDividerComponent,
		ZardButtonComponent,
		ZardInputDirective,
		PasswordChecklist,
	],
	templateUrl: './register.html',
})
export class Register {
	private readonly fb = inject(FormBuilder)
	private readonly router = inject(Router)
	private readonly authService = inject(AuthService)
	private readonly googleAuthService = inject(GoogleAuthService)

	readonly ArrowRightIcon = ArrowRightIcon
	readonly EyeOffIcon = EyeOffIcon
	readonly EyeIcon = EyeIcon

	form = this.fb.nonNullable.group({
		name: ['', [Validators.required]],
		email: ['', [Validators.email, Validators.required]],
		password: [
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
	})

	readonly passwordValue = toSignal(
		this.form.controls.password.valueChanges.pipe(
			startWith(''),
			map((v) => v ?? ''),
		),
		{ initialValue: '' },
	)

	readonly passwordFocused = signal(false)

	showPassword = signal(false)

	togglePassword() {
		this.showPassword.update((v) => !v)
	}

	onGoogleSignIn() {
		this.googleAuthService
			.signIn()
			.pipe(switchMap((credential) => this.authService.googleLogin(credential)))
			.subscribe({
				next: () => {
					toast.success('Logged in successfully')
					this.router.navigateByUrl('/dashboard')
				},
				error: () => {
					toast.error('Google sign-in failed, please try again.')
				},
			})
	}

	onSubmit() {
		const credentials = this.form.getRawValue()

		this.authService.register(credentials).subscribe({
			next: () => {
				toast.success('Account create successfully')
				this.router.navigateByUrl('/dashboard')
			},
			error: () => {
				toast.error('Registration failed, please try again later.')
			},
		})
	}
}
