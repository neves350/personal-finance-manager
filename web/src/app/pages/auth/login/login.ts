import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { GoogleAuthService } from '@core/services/google-auth.service'
import { ArrowRightIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { switchMap } from 'rxjs'
import { ZardAvatarComponent } from '@/shared/components/ui/avatar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardInputDirective } from '@/shared/components/ui/input'
import { environment } from '../../../../environments/environment'

@Component({
	selector: 'app-login',
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		RouterLink,
		ZardAvatarComponent,
		ZardButtonComponent,
		ZardDividerComponent,
		ZardInputDirective,
	],
	templateUrl: './login.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
	private readonly fb = inject(FormBuilder)
	private readonly router = inject(Router)
	private readonly authService = inject(AuthService)
	private readonly googleAuthService = inject(GoogleAuthService)

	readonly ArrowRightIcon = ArrowRightIcon
	readonly googleAuthEnabled = environment.googleAuthEnabled

	form = this.fb.nonNullable.group({
		email: ['', [Validators.email, Validators.required]],
		password: ['', [Validators.minLength(6), Validators.required]],
	})

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

		this.authService.login(credentials).subscribe({
			next: () => {
				toast.success('Logged in successfully')
				this.router.navigateByUrl('/dashboard')
			},
			error: (err) => {
				const message = err?.error?.message
				if (message === 'Invalid email' || message === 'Invalid password') {
					toast.error('Incorrect email or password')
				} else {
					toast.error('Login failed, please try again later.')
				}
			},
		})
	}
}
