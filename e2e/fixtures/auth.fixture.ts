import { test as base, type Page } from '@playwright/test'

type AuthFixtures = {
	authenticatedPage: Page
}

// share cookies with Playwright page, the page are authenticated without fill the forms
export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page, request }, use) => {
		await request.post('http://localhost:3000/sessions/password', {
			data: { email: 'test@example.com', password: 'password123' },
		})
		await use(page)
	},
})

export { expect } from '@playwright/test'
