import angular from '@analogjs/vite-plugin-angular'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
	return {
		plugins: [angular()],
		test: {
			watch: false,
			globals: true,
			environment: 'jsdom',
			setupFiles: ['src/test-setup.ts'],
			include: ['**/*.spec.ts'],
			reporters: ['default'],
			browser: {
				provider: playwright(),
				enabled: true,
				instances: [
					{ browser: 'chromium', viewport: { width: 1920, height: 1080 } },
				],
			},
		},
		define: {
			'import.meta.vitest': mode !== 'production',
		},
	}
})
