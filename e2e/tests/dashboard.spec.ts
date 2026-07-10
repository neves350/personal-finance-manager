import { expect, test } from '../fixtures/auth.fixture'

test.describe('Dashboard', () => {
	test('renders without errors', async ({ authenticatedPage: page }) => {
		const consoleErrors: string[] = []
		page.on('console', (msg) => {
			if (msg.type() === 'error') consoleErrors.push(msg.text())
		})

		await page.goto('/dashboard')
		await page.waitForURL(/dashboard/)

		await expect(page.locator('app-balance-card')).toBeVisible()
		await expect(page.locator('app-income-card')).toBeVisible()
		await expect(page.locator('app-expense-card')).toBeVisible()
		await expect(page.locator('app-savings-rate-card')).toBeVisible()

		expect(consoleErrors).toEqual([])
	})

	test('recent transactions visible', async ({ authenticatedPage: page }) => {
		await page.goto('/dashboard')
		await page.waitForURL(/dashboard/)

		await expect(page.getByText('Recent Movements')).toBeVisible()
		await expect(
			page.locator('app-dashboard-transactions table tbody tr').first(),
		).toBeVisible()
	})
})
