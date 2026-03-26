import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	signal,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { OpenBankingService } from '@core/services/open-banking.service'
import type { OpenBankingConnection } from '@core/api/open-banking.interface'
import { toast } from 'ngx-sonner'
import {
	BuildingIcon,
	CheckCircle2Icon,
	ClockIcon,
	LucideAngularModule,
	RefreshCwIcon,
	RotateCwIcon,
	Trash2Icon,
	XIcon,
} from 'lucide-angular'
import { ZardBadgeComponent } from '@/shared/components/ui/badge'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'

@Component({
	selector: 'app-connect-bank',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		LucideAngularModule,
		ZardButtonComponent,
		ZardCardComponent,
		ZardLoaderComponent,
		ZardBadgeComponent,
	],
	templateUrl: './connect-bank.html',
})
export class ConnectBank implements OnInit {
	readonly BuildingIcon = BuildingIcon
	readonly RefreshCwIcon = RefreshCwIcon
	readonly RotateCwIcon = RotateCwIcon
	readonly Trash2Icon = Trash2Icon
	readonly XIcon = XIcon
	readonly CheckCircle2Icon = CheckCircle2Icon
	readonly ClockIcon = ClockIcon

	private readonly route = inject(ActivatedRoute)
	readonly openBankingService = inject(OpenBankingService)

	readonly providers = this.openBankingService.providers
	readonly loading = this.openBankingService.loading
	readonly error = this.openBankingService.error
	readonly connections = this.openBankingService.connections
	readonly hasConnections = this.openBankingService.hasConnections

	readonly connectingProvider = signal<string | null>(null)
	readonly syncingId = signal<string | null>(null)
	readonly refreshingId = signal<string | null>(null)
	readonly disconnectingId = signal<string | null>(null)
	readonly keepData = signal(true)

	ngOnInit(): void {
		this.openBankingService.loadProviders().subscribe()

		// Check if returning from Salt Edge callback
		const isCallback =
			this.route.snapshot.queryParamMap.get('callback') === 'success'

		if (isCallback) {
			this.openBankingService.handleCallback().subscribe({
				next: () => {
					toast.success('Bank connected successfully!')
				},
				error: () => {
					toast.error('Failed to sync bank connection')
					this.openBankingService.loadConnections().subscribe()
				},
			})
		} else {
			this.openBankingService.loadConnections().subscribe()
		}
	}

	isConnected(providerCode: string): boolean {
		return this.connections().some((c) => c.providerCode === providerCode)
	}

	connect(providerCode: string) {
		this.connectingProvider.set(providerCode)
		this.openBankingService.connectBank(providerCode).subscribe({
			next: (url) => {
				window.location.href = url
			},
			error: () => {
				this.connectingProvider.set(null)
			},
		})
	}

	syncNow(connection: OpenBankingConnection) {
		this.syncingId.set(connection.id!)
		this.openBankingService.syncConnection(connection.id!).subscribe({
			next: () => {
				this.syncingId.set(null)
				toast.success(`${connection.providerName} synced successfully`)
			},
			error: (err) => {
				this.syncingId.set(null)
				toast.error(err.error?.message || 'Failed to sync')
			},
		})
	}

	refresh(connection: OpenBankingConnection) {
		this.refreshingId.set(connection.id!)
		this.openBankingService.refreshConnection(connection.id!).subscribe({
			next: () => {
				this.refreshingId.set(null)
				toast.success(`${connection.providerName} refresh started`)
			},
			error: (err) => {
				this.refreshingId.set(null)
				toast.error(err.error?.message || 'Failed to refresh')
			},
		})
	}

	startDisconnect(connectionId: string) {
		this.disconnectingId.set(connectionId)
		this.keepData.set(true)
	}

	cancelDisconnect() {
		this.disconnectingId.set(null)
	}

	confirmDisconnect(connection: OpenBankingConnection) {
		this.openBankingService
			.disconnect(connection.id!, this.keepData())
			.subscribe({
				next: () => {
					this.disconnectingId.set(null)
					toast.success(`${connection.providerName} disconnected`)
				},
				error: (err) => {
					this.disconnectingId.set(null)
					toast.error(err.error?.message || 'Failed to disconnect')
				},
			})
	}

	statusBadge(status: string): 'success' | 'warning' | 'destructive' {
		if (status === 'ACTIVE') return 'success'
		if (status === 'INACTIVE') return 'warning'
		return 'destructive'
	}

	formatDate(date: string | undefined): string {
		if (!date) return '—'
		return new Date(date).toLocaleDateString('pt-PT', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		})
	}
}
