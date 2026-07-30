import {
	type BrowserContextOptions,
	test as base,
	type Page,
} from '@playwright/test'

type AuthFixtures = {
	authenticatedPage: Page
}

type AuthWorkerFixtures = {
	authStorageState: NonNullable<BrowserContextOptions['storageState']>
}

// login runs once per worker (not once per test) - the login endpoint is
// rate-limited, and calling it from every test that needs auth quickly
// trips the throttler and cascades into unrelated failures
export const test = base.extend<AuthFixtures, AuthWorkerFixtures>({
	authStorageState: [
		async ({ browser }, use) => {
			const context = await browser.newContext()
			await context.request.post('http://localhost:3000/sessions/password', {
				data: { email: 'test@example.com', password: 'password123' },
			})
			const storageState = await context.storageState()
			await context.close()
			await use(storageState)
		},
		{ scope: 'worker' },
	],

	authenticatedPage: async ({ browser, authStorageState }, use) => {
		const context = await browser.newContext({ storageState: authStorageState })
		const page = await context.newPage()
		await use(page)
		await context.close()
	},
})

export { expect } from '@playwright/test'
