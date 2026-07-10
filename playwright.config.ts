import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./e2e/tests",

	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,

	reporter: "html",

	globalSetup: "./e2e/setup/global-setup.ts",
	globalTeardown: "./e2e/setup/global-teardown.ts",

	use: {
		baseURL: "http://localhost:4200",
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: [
		{
			command: "npm run start:dev -w api",
			url: "http://127.0.0.1:3000",
			reuseExistingServer: !process.env.CI,
			timeout: 300_000,
			stdout: "pipe",
			stderr: "pipe",
		},
		{
			command: "npm run start -w web -- --host 0.0.0.0",
			url: "http://127.0.0.1:4200",
			reuseExistingServer: !process.env.CI,
			timeout: 300_000,
			stdout: "pipe",
			stderr: "pipe",
		},
	],
})
