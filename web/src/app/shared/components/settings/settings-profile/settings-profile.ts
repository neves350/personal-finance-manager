import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	inject,
	signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { AuthService } from '@core/services/auth/auth.service'
import { UsersService } from '@core/services/users.service'
import { toast } from 'ngx-sonner'
import { ZardAvatarComponent } from '../../ui/avatar'
import { ZardButtonComponent } from '../../ui/button'
import { ZardInputDirective } from '../../ui/input'

@Component({
	selector: 'app-settings-profile',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		ReactiveFormsModule,
		ZardAvatarComponent,
		ZardButtonComponent,
		ZardInputDirective,
	],
	templateUrl: './settings-profile.html',
})
export class SettingsProfile {
	private readonly authService = inject(AuthService)
	private readonly usersService = inject(UsersService)
	private readonly fb = inject(FormBuilder)
	private readonly cdr = inject(ChangeDetectorRef)

	readonly user = this.authService.currentUser
	readonly saving = signal(false)
	readonly pendingAvatarUrl = signal<string | undefined>(undefined)
	private readonly avatarDeleted = signal(false)

	readonly initials = computed(() => {
		const name = this.user()?.name
		if (!name) return ''
		return name
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('')
	})

	readonly avatarPreview = computed((): string | undefined => {
		if (this.avatarDeleted()) return undefined
		const pending = this.pendingAvatarUrl()
		if (pending !== undefined) return pending
		return this.user()?.avatarUrl ?? undefined
	})

	form = this.fb.nonNullable.group({
		name: [''],
		email: [''],
	})

	constructor() {
		const user = this.user()
		if (user) {
			this.form.patchValue({
				name: user.name,
				email: user.email,
			})
		}
	}

	private readonly formValues = toSignal(this.form.valueChanges, {
		initialValue: this.form.value,
	})

	readonly hasChanges = computed(() => {
		const user = this.user()
		if (!user) return false

		const { name, email } = this.formValues()
		const avatarChanged =
			this.pendingAvatarUrl() !== undefined || this.avatarDeleted()

		return (
			avatarChanged ||
			(name !== '' && name !== user.name) ||
			(email !== '' && email !== user.email)
		)
	})

	private readonly MAX_AVATAR_SIZE_MB = 2
	private readonly MAX_AVATAR_SIZE = this.MAX_AVATAR_SIZE_MB * 1024 * 1024

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		if (!file) return

		if (file.size > this.MAX_AVATAR_SIZE) {
			toast.error(`Image must be smaller than ${this.MAX_AVATAR_SIZE_MB}MB`)
			input.value = ''
			return
		}

		const reader = new FileReader()
		reader.onload = () => {
			this.pendingAvatarUrl.set(reader.result as string)
			this.cdr.markForCheck()
		}
		reader.readAsDataURL(file)
	}

	deleteImage() {
		this.avatarDeleted.set(true)
		this.pendingAvatarUrl.set(undefined)
	}

	save() {
		const userId = this.user()?.id
		if (!userId || !this.hasChanges()) return

		const { name, email } = this.form.value
		const user = this.user()
		if (!user) return

		const data: Record<string, string> = {}
		if (name && name !== user.name) data['name'] = name
		if (email && email !== user.email) data['email'] = email

		if (this.avatarDeleted()) {
			data['avatarUrl'] = ''
		} else {
			const pendingAvatar = this.pendingAvatarUrl()
			if (pendingAvatar !== undefined) {
				data['avatarUrl'] = pendingAvatar
			}
		}

		this.saving.set(true)
		this.usersService.update(userId, data).subscribe({
			next: (updatedUser) => {
				this.authService.currentUser.set(updatedUser)
				this.pendingAvatarUrl.set(undefined)
				this.avatarDeleted.set(false)
				this.saving.set(false)
				toast.success('Profile updated successfully')
			},
			error: (err) => {
				this.saving.set(false)
				toast.error(err.error?.message || 'Failed to update profile')
			},
		})
	}
}
