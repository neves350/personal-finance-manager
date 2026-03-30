import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	output,
	signal,
} from '@angular/core'
import {
	ConnectionStatus,
	OpenBankingConnection,
} from '@core/api/open-banking.interface'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	EllipsisVerticalIcon,
	LucideAngularModule,
	RotateCwIcon,
	Trash2Icon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { lastValueFrom } from 'rxjs'
import { ZardBadgeComponent } from '../../ui/badge'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDialogService } from '../../ui/dialog'
import {
	ZardPopoverCloseDirective,
	ZardPopoverComponent,
	ZardPopoverDirective,
} from '../../ui/popover'
import { ProviderLogo } from '../provider-logo/provider-logo'

@Component({
	selector: 'app-connection-row',
	imports: [
		ProviderLogo,
		ZardBadgeComponent,
		ZardButtonComponent,
		LucideAngularModule,
		ZardPopoverDirective,
		ZardPopoverCloseDirective,
		ZardPopoverComponent,
		ZardPopoverCloseDirective,
	],
	templateUrl: './connection-row.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionRow {
	readonly connection = input.required<OpenBankingConnection>()
	readonly disconnected = output<void>()

	readonly RotateCwIcon = RotateCwIcon
	readonly EllipsisVerticalIcon = EllipsisVerticalIcon
	readonly Trash2Icon = Trash2Icon

	readonly syncing = signal(false)

	private readonly obService = inject(OpenBankingService)
	private readonly dialogService = inject(ZardDialogService)

	readonly accountCount = computed(
		() => this.connection().accounts?.length ?? 0,
	)

	readonly isActive = computed(
		() => this.connection().status === ConnectionStatus.ACTIVE,
	)

	readonly lastSyncLabel = computed(() => {
		const raw = this.connection().lastSyncAt
		if (!raw) return null
		const diff = (Date.now() - new Date(raw).getTime()) / 1000
		const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
		if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
		if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour')
		return rtf.format(-Math.floor(diff / 86400), 'day')
	})

	readonly consentExpiringSoon = computed(() => {
		const expiresAt = this.connection().consentExpiresAt
		if (!expiresAt) return false
		return (
			(new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30
		) // expires in the next 30 days
	})

	sync() {
		const id = this.connection().id
		if (!id || this.syncing()) return
		this.syncing.set(true)
		this.obService.syncConnection(id).subscribe({
			next: () => {
				toast.success(`${this.connection().providerName} synced`)
				this.syncing.set(false)
			},
			error: (err) => {
				toast.error(err.error?.message || 'Sync failed')
				this.syncing.set(false)
			},
		})
	}

	disconnect() {
		const conn = this.connection()
		if (!conn.id) return
		const accountText =
			this.accountCount() > 1
				? `All ${this.accountCount()} accounts from this connection`
				: 'This account'
		this.dialogService.create({
			zTitle: `Disconnect ${conn.providerName}?`,
			zDescription: `${accountText} will be marked as disconnected. Synced transactions remain.`,
			zCancelText: 'Cancel',
			zWidth: '450px',
			zOkText: 'Disconnect',
			zOkDestructive: true,
			zOnOk: async () => {
				try {
					await lastValueFrom(this.obService.disconnect(conn.id!, true))
					toast.success(`${conn.providerName} disconnected`)
					this.disconnected.emit()
					return true
				} catch (err: unknown) {
					const error = err as { error?: { message?: string } }
					toast.error(error.error?.message || 'Failed to disconnect')
					return false
				}
			},
			zCustomClasses:
				'rounded-2xl border-2 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
