import { Component, inject } from '@angular/core'
import { Router, RouterOutlet } from '@angular/router'
import { BackendReadinessService } from '@core/services/backend-readiness.service'
import { NgxSonnerToaster } from 'ngx-sonner'
import { ZardLoaderComponent } from './shared/components/ui/loader'

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, NgxSonnerToaster, ZardLoaderComponent],
	template: `
		@if (readiness.error()) {
  		<div class="fixed inset-0 flex flex-col items-center justify-center gap-4">
    		<p class="text-lg font-medium text-destructive">Unable to reach the server</p>
    		<p class="text-sm text-muted-foreground">Please check your connection and try again.</p>
    		<button
      		class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      		(click)="retry()"
    		>
      		Retry
    		</button>
  	</div>
	} @else if (!readiness.ready()) {
  	<div class="fixed inset-0 flex flex-col items-center justify-center gap-4">
    	<z-loader />
    	<p class="text-sm text-muted-foreground">{{ readiness.statusMessage() }}</p>
  	</div>
	} @else {
  	<router-outlet />
	}
		<ngx-sonner-toaster richColors [expand]="true" position="bottom-center" />
	`,
})
export class App {
	readonly readiness = inject(BackendReadinessService)
	private readonly router = inject(Router)

	retry() {
		this.readiness.reset()
		this.router.navigateByUrl(this.router.url)
	}
}
