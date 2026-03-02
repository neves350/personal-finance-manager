import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { AuthService } from '@core/services/auth/auth.service'
import {
	ArrowLeftIcon,
	LockKeyholeIcon,
	LucideAngularModule,
	MailOpenIcon,
	RectangleEllipsisIcon,
} from 'lucide-angular'
import { NgxSonnerToaster, toast } from 'ngx-sonner'

@Component({
	selector: 'app-reset',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		LucideAngularModule,
		ReactiveFormsModule,
		NgxSonnerToaster,
		RouterLink,
	],
	templateUrl: './reset.html',
})
export class Reset implements OnInit {
	readonly MailOpenIcon = MailOpenIcon
	readonly LockKeyholeIcon = LockKeyholeIcon
	readonly RectangleEllipsisIcon = RectangleEllipsisIcon
	readonly ArrowLeftIcon = ArrowLeftIcon

	private readonly fb = inject(FormBuilder)
	private readonly route = inject(ActivatedRoute)
	private readonly router = inject(Router)
	private readonly authService = inject(AuthService)

	form = this.fb.nonNullable.group({
		code: [
			'',
			[Validators.required, Validators.minLength(5), Validators.maxLength(5)],
		],
		password: ['', [Validators.minLength(6), Validators.required]],
	})

	ngOnInit() {
		// Auto-fill code from URL query param
		const code = this.route.snapshot.queryParamMap.get('code')
		if (code) {
			this.form.patchValue({ code })
		}
	}

	onSubmit() {
		const { code, password } = this.form.getRawValue()

		this.authService.resetPassword(code, password).subscribe({
			next: (message) => {
				toast.success(message)
				this.router.navigate(['/login'])
			},
			error: () => toast.error('Invalid or expired code'),
		})
	}
}
