import { expect, test } from '@playwright/test'
import { test as authTest } from '../fixtures/auth.fixture'

test.describe('Auth', () => {
	test('register a new user', async ({ page }) => {
		await page.goto('/register')

		await page.locator('input[formcontrolname="name"]').fill('New User')
		await page
			.locator('input[formcontrolname="email"]')
			.fill('newuser@example.com')
		await page.locator('input[formcontrolname="password"]').fill('Password123!')

		await page.locator('button[type="submit"]').click()

		await expect(page).toHaveURL(/dashboard/)
	})

	test('login with valid credentials', async ({ page }) => {
		await page.goto('/login')

		await page
			.locator('input[formcontrolname="email"]')
			.fill('test@example.com')
		await page.locator('input[formcontrolname="password"]').fill('password123')

		await page.locator('button[type="submit"]').click()

		await expect(page).toHaveURL(/dashboard/)
	})

	test('login with invalid credentials', async ({ page }) => {
		await page.goto('/login')

		await page
			.locator('input[formcontrolname="email"]')
			.fill('test@example.com')
		await page
			.locator('input[formcontrolname="password"]')
			.fill('WrongPassword1!')

		await page.locator('button[type="submit"]').click()

		await expect(page.locator('[data-sonner-toast]')).toContainText(
			'Incorrect email or password',
		)
	})

	test('auth guard redirects to login', async ({ page }) => {
		await page.goto('/dashboard')

		await expect(page).toHaveURL(/\/login\?returnUrl/)
	})
})

authTest('logout', async ({ authenticatedPage: page }) => {
	await page.goto('/dashboard')
	await page.waitForURL(/dashboard/)

	await page.getByLabel('User menu').click()
	await page.getByText('Log Out').click()

	await expect(page).toHaveURL(/\/login/)
})
