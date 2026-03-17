import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('AuthController (e2e)', () => {
	let app: INestApplication<App>
	let testEmail: string
	let testUserId: string
	let testCookies: string[]
	const testPassword = 'Test1234.'

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		app.use(cookieParser())
		app.useGlobalPipes(new ValidationPipe({ transform: true }))
		await app.init()

		testEmail = `auth-test-${Date.now()}@example.com`
		const registerRes = await request(app.getHttpServer())
			.post('/users')
			.send({ name: 'User Test 1', email: testEmail, password: testPassword })

		testUserId = registerRes.body.user.id
		testCookies = registerRes.headers['set-cookie'] as unknown as string[]
	}, 30000)

	afterAll(async () => {
		if (testUserId && testCookies) {
			await request(app.getHttpServer())
				.delete(`/users/${testUserId}`)
				.set('Cookie', testCookies)
		}
		await app.close()
	}, 30000)

	it('should register a new user', async () => {
		const res = await request(app.getHttpServer())
			.post('/users')
			.send({
				name: 'User 1',
				email: `test-${Date.now()}@example.com`,
				password: 'Test1234.',
			})
			.expect(201)

		expect(res.body.user).toHaveProperty('id')
		expect(res.body.user).toHaveProperty('email')

		// Clean up the registered user
		const userId = res.body.user.id
		const cookies = res.headers['set-cookie'] as unknown as string[]
		await request(app.getHttpServer())
			.delete(`/users/${userId}`)
			.set('Cookie', cookies)
	})

	it('should login a user and set cookies', async () => {
		const res = await request(app.getHttpServer())
			.post('/sessions/password')
			.send({ email: testEmail, password: testPassword })
			.expect(201)

		const cookies = res.headers['set-cookie'] as unknown as string[]
		expect(cookies).toBeDefined()
		expect(cookies.some((c) => c.startsWith('accessToken'))).toBe(true)
		expect(cookies.some((c) => c.startsWith('refreshToken'))).toBe(true)
	})

	it('should get the current user profile', async () => {
		const loginRes = await request(app.getHttpServer())
			.post('/sessions/password')
			.send({ email: testEmail, password: testPassword })

		const cookies = loginRes.headers['set-cookie']

		const res = await request(app.getHttpServer())
			.get('/profile')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id')
		expect(res.body).toHaveProperty('email')
	})

	it('should refresh tokens and set new cookies', async () => {
		const res = await request(app.getHttpServer())
			.post('/refresh')
			.set('Cookie', testCookies)
			.expect(201)

		const cookies = res.headers['set-cookie'] as unknown as string[]
		expect(cookies).toBeDefined()
		expect(cookies.some((c) => c.startsWith('accessToken'))).toBe(true)
		expect(cookies.some((c) => c.startsWith('refreshToken'))).toBe(true)
	})

	it('should reject refresh without a token', async () => {
		await request(app.getHttpServer()).post('/refresh').expect(401)
	})

	it('should reject unauthenticated access to profile', async () => {
		await request(app.getHttpServer()).get('/profile').expect(401)
	})

	it('should logout and clear cookies', async () => {
		const loginRes = await request(app.getHttpServer())
			.post('/sessions/password')
			.send({ email: testEmail, password: testPassword })

		const cookies = loginRes.headers['set-cookie']

		await request(app.getHttpServer())
			.post('/logout')
			.set('Cookie', cookies)
			.expect(201)
	})
})
