import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	signal,
} from '@angular/core'
import { OpenBankingService } from '@core/services/open-banking.service'
import {
	BuildingIcon,
	LucideAngularModule,
	RefreshCwIcon,
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

	readonly openBankingService = inject(OpenBankingService)

	readonly providers = this.openBankingService.providers
	readonly loading = this.openBankingService.loading
	readonly error = this.openBankingService.error
	readonly connections = this.openBankingService.connections

	readonly connectingProvider = signal<string | null>(null)

	ngOnInit(): void {
		this.openBankingService.loadProviders().subscribe()
		this.openBankingService.loadConnections().subscribe()
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
}
