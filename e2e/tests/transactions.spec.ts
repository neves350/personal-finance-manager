import { expect, test } from '../fixtures/auth.fixture'

test.describe
	.serial('Transaction CRUD', () => {
		test('create a transaction', async ({ authenticatedPage: page }) => {
			await page.goto('/transactions')
			await page.locator('app-transactions-row').first().waitFor()

			await page.getByText('New Transaction').click()
			await expect(page.locator('[data-testid="z-title"]')).toHaveText(
				'New Transaction',
			)

			await page.locator('input[formcontrolname="amount"]').fill('99.50')
			await page.locator('input[formcontrolname="title"]').fill('Rent payment')

			await page
				.locator(
					'z-select[formcontrolname="categoryId"] button[role="combobox"]',
				)
				.click()
			await page.getByRole('option', { name: 'Groceries' }).click()

			await page
				.locator(
					'z-select[formcontrolname="bankAccountId"] button[role="combobox"]',
				)
				.click()
			await page.getByRole('option', { name: 'Test Checking' }).click()

			await page.locator('[data-testid="z-ok-button"]').click()

			await expect(page.getByText('Rent Payment')).toBeVisible()
		})

		test('edit a transaction', async ({ authenticatedPage: page }) => {
			await page.goto('/transactions')
			await page.locator('app-transactions-row').first().waitFor()

			const row = page.locator('app-transactions-row', {
				hasText: 'Weekly Groceries',
			})
			await row.locator('z-button').click()

			await page.locator('z-popover').getByText('Edit').click()
			await expect(page.locator('[data-testid="z-title"]')).toHaveText(
				'Edit Transaction',
			)

			await page
				.locator('input[formcontrolname="title"]')
				.fill('Edited groceries')
			await page.locator('input[formcontrolname="amount"]').fill('55')

			await page.locator('[data-testid="z-ok-button"]').click()

			await expect(page.getByText('Edited Groceries')).toBeVisible()
		})

		test('delete a transaction', async ({ authenticatedPage: page }) => {
			await page.goto('/transactions')
			await page.locator('app-transactions-row').first().waitFor()

			const row = page.locator('app-transactions-row', {
				hasText: 'Supermarket Run',
			})
			await expect(row).toBeVisible()

			await row.locator('z-button').click()
			await page.locator('z-popover').getByText('Delete').click()

			await expect(page.locator('[data-testid="z-title"]')).toHaveText(
				'Remove transaction',
			)
			await page.locator('[data-testid="z-ok-button"]').click()

			await expect(row).not.toBeVisible()
		})

		test('filter by type', async ({ authenticatedPage: page }) => {
			await page.goto('/transactions')
			await page.locator('app-transactions-row').first().waitFor()

			await page.locator('z-button:has-text("Filter")').click()
			await page.locator('z-dropdown-menu-content').waitFor()

			await page
				.locator('z-dropdown-menu-content z-select')
				.first()
				.locator('button[role="combobox"]')
				.click()
			await page.getByRole('option', { name: 'Income' }).click()

			await expect(page.locator('app-transactions-row')).toHaveCount(1)
			await expect(page.getByText('Monthly Salary')).toBeVisible()
		})
	})
