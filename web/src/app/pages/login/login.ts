import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import {
	ArrowRightIcon,
	LockKeyholeIcon,
	LucideAngularModule,
	MailIcon,
	WalletMinimalIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardAvatarComponent } from '@/shared/components/ui/avatar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardInputDirective } from '@/shared/components/ui/input'

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

	readonly WalletMinimalIcon = WalletMinimalIcon
	readonly MailIcon = MailIcon
	readonly LockKeyholeIcon = LockKeyholeIcon
	readonly ArrowRightIcon = ArrowRightIcon
	readonly toast = toast

	form = this.fb.nonNullable.group({
		email: ['', [Validators.email, Validators.required]],
		password: ['', [Validators.minLength(6), Validators.required]],
	})

	onSubmit() {
		const credentials = this.form.getRawValue()

		this.authService.login(credentials).subscribe({
			next: () => {
				this.router.navigateByUrl('/dashboard')
			},
			error: () => {
				toast.error('Login failed, please try again later.')
			},
		})
	}
}
