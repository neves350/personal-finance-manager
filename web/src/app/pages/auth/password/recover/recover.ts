import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import { ArrowRightIcon, LucideAngularModule } from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardAvatarComponent } from '@/shared/components/ui/avatar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardDividerComponent } from '@/shared/components/ui/divider'
import { ZardInputDirective } from '@/shared/components/ui/input'

@Component({
	selector: 'app-recover',
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		RouterLink,
		ZardAvatarComponent,
		ZardDividerComponent,
		ZardInputDirective,
		ZardButtonComponent,
	],
	templateUrl: './recover.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Recover {
	readonly ArrowRightIcon = ArrowRightIcon

	private readonly fb = inject(FormBuilder)
	private readonly router = inject(Router)
	private readonly authService = inject(AuthService)

	form = this.fb.nonNullable.group({
		email: ['', [Validators.email, Validators.required]],
	})

	onSubmit() {
		const { email } = this.form.getRawValue()

		this.authService.requestPasswordRecover(email).subscribe({
			next: (message) => {
				toast.success(message)
				this.router.navigate(['/password/reset'])
			},
			error: () => toast.error('Failed to send recovery email'),
		})
	}
}
