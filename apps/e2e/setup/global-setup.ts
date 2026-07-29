import { execSync } from 'node:child_process'
import path from 'node:path'
import { cleanup, disconnect, seed } from './seed'

const apiDir = path.resolve(__dirname, '../../api')

export default async function globalSetup() {
	console.log('[e2e] Running prisma migrate deploy...')
	execSync('npx prisma migrate deploy', {
		cwd: apiDir,
		stdio: 'inherit',
		env: {
			...process.env,
			DATABASE_URL:
				process.env.DATABASE_URL ??
				'postgresql://test:test@localhost:5433/expenses_test',
		},
	})

	console.log('[e2e] Seeding test database...')
	await cleanup()
	await seed()
	await disconnect()

	console.log('[e2e] Global setup complete')
}
