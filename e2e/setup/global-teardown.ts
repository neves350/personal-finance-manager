import { execSync } from 'child_process'

export default async function globalTeardown() {
	try {
		execSync('docker compose -f docker-compose.test.yml down', {
			cwd: process.cwd(),
			stdio: 'inherit',
		})
		console.log('[e2e] Test database container stopped')
	} catch {
		console.warn('[e2e] Could not stop test container (may not be running)')
	}
}
