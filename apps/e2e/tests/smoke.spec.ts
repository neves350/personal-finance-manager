import { expect, test } from '@playwright/test'

test('app loads login page', async ({ page }) => {
	await page.goto('/login')
	await expect(page).toHaveURL(/login/)
})
