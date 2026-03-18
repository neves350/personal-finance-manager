import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('StatisticController (e2e)', () => {
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

	it('should get statistics overview', async () => {
		const res = await request(app.getHttpServer())
			.get('/statistics/overview')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('totalExpenses')
		expect(res.body).toHaveProperty('totalIncome')
		expect(res.body).toHaveProperty('balance')
		expect(res.body).toHaveProperty('transactionCount')
		expect(res.body).toHaveProperty('topExpenseCategories')
		expect(Array.isArray(res.body.topExpenseCategories)).toBe(true)
	})

	it('should get statistics by category', async () => {
		const res = await request(app.getHttpServer())
			.get('/statistics/by-category')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('type')
		expect(res.body).toHaveProperty('totalAmount')
		expect(res.body).toHaveProperty('totalTransactions')
		expect(res.body).toHaveProperty('categories')
		expect(Array.isArray(res.body.categories)).toBe(true)
	})

	it('should get statistics trends', async () => {
		const res = await request(app.getHttpServer())
			.get('/statistics/trends')
			.query({ period: 'month' })
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('current')
		expect(res.body).toHaveProperty('previous')
		expect(res.body).toHaveProperty('change')
		expect(res.body.current).toHaveProperty('expenses')
		expect(res.body.current).toHaveProperty('income')
		expect(res.body.current).toHaveProperty('balance')
	})

	it('should get statistics daily totals', async () => {
		const res = await request(app.getHttpServer())
			.get('/statistics/daily-totals')
			.query({ period: 'month' })
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('labels')
		expect(res.body).toHaveProperty('income')
		expect(res.body).toHaveProperty('expenses')
		expect(res.body).toHaveProperty('balance')
		expect(Array.isArray(res.body.labels)).toBe(true)
	})
})
