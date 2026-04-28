import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth.service'
import { PasswordChecklist } from '@pages/auth/register/password-checklist'
import {
	ArrowRightIcon,
	EyeIcon,
	EyeOffIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { map, startWith } from 'rxjs'
import { ZardAvatarComponent } from '@/shared/components/ui/avatar'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardInputDirective } from '@/shared/components/ui/input'

@Component({
	selector: 'app-reset',
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		RouterLink,
		ZardAvatarComponent,
		ZardInputDirective,
		ZardButtonComponent,
		PasswordChecklist,
	],
	templateUrl: './reset.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reset implements OnInit {
	private readonly fb = inject(FormBuilder)
	private readonly route = inject(ActivatedRoute)
	private readonly router = inject(Router)
	private readonly authService = inject(AuthService)

	readonly ArrowRightIcon = ArrowRightIcon
	readonly EyeOffIcon = EyeOffIcon
	readonly EyeIcon = EyeIcon

	form = this.fb.nonNullable.group({
		code: [
			'',
			[Validators.required, Validators.minLength(5), Validators.maxLength(5)],
		],
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

	ngOnInit() {
		// Auto-fill code from URL query param
		const code = this.route.snapshot.queryParamMap.get('code')
		if (code) {
			this.form.patchValue({ code })
		}
	}

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

	onSubmit() {
		const { code, password } = this.form.getRawValue()

		this.authService.resetPassword(code, password).subscribe({
			next: () => {
				toast.success('Password reseted successfully')
				this.router.navigate(['/login'])
			},
			error: () => toast.error('Invalid or expired code'),
		})
	}
}
