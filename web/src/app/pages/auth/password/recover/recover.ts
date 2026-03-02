import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import {
	ArrowLeftIcon,
	FingerprintPatternIcon,
	LucideAngularModule,
	MailIcon,
} from 'lucide-angular'
import { NgxSonnerToaster, toast } from 'ngx-sonner'

@Component({
	selector: 'app-recover',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		NgxSonnerToaster,
		RouterLink,
	],
	templateUrl: './recover.html',
})
export class Recover {
	readonly MailIcon = MailIcon
	readonly FingerprintPatternIcon = FingerprintPatternIcon
	readonly ArrowLeftIcon = ArrowLeftIcon

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
