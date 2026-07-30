import { bootstrapApplication } from '@angular/platform-browser'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { App } from './app/app'
import { appConfig } from './app/app.config'

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
injectSpeedInsights()
