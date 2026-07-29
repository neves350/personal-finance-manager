import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from '@angular/common/http'
import {
	type ApplicationConfig,
	provideBrowserGlobalErrorListeners,
} from '@angular/core'
import {
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
} from '@angular/router'
import { authInterceptor } from '@core/interceptors/auth.interceptor'
import { PageTitleStrategy } from '@core/strategies/page-title.strategy'
import { provideZard } from '@/shared/core/provider/providezard'
import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes, withComponentInputBinding()),
		provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
		provideZard(),
		{ provide: TitleStrategy, useClass: PageTitleStrategy },
	],
}
