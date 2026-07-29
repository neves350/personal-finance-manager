import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('ExportController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let testEmail: string
	const testPassword = 'Test1234.'

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		app.use(cookieParser())
		app.useGlobalPipes(new ValidationPipe({ transform: true }))
		await app.init()

		testEmail = `e2e-users-${Date.now()}@example.com`
		const registerRes = await request(app.getHttpServer()).post('/users').send({
			name: 'E2E Users Test',
			email: testEmail,
			password: testPassword,
		})

		cookies = registerRes.headers['set-cookie'] as unknown as string[]
		userId = registerRes.body.user.id
	}, 30000)

	afterAll(async () => {
		if (userId && cookies) {
			await request(app.getHttpServer())
				.delete(`/users/${userId}`)
				.set('Cookie', cookies)
		}
		await app.close()
	}, 30000)

	it('should export transactions as CSV', async () => {
		const res = await request(app.getHttpServer())
			.get('/export/transactions/csv')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.headers['content-type']).toMatch(/text\/csv/)
		expect(res.headers['content-disposition']).toMatch(
			/attachment; filename="transactions_.*\.csv"/,
		)
	})

	it('should export transactions as PDF', async () => {
		const res = await request(app.getHttpServer())
			.get('/export/transactions/pdf')
			.set('Cookie', cookies)
			.buffer(true)
			.parse((res, callback) => {
				const chunks: Buffer[] = []
				res.on('data', (chunk: Buffer) => chunks.push(chunk))
				res.on('end', () => callback(null, Buffer.concat(chunks)))
			})
			.expect(200)

		expect(res.headers['content-type']).toMatch(/application\/pdf/)
		expect(res.headers['content-disposition']).toMatch(
			/attachment; filename="transactions_.*\.pdf"/,
		)
	})
})
