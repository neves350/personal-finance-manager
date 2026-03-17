import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('UsersController (e2e)', () => {
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

		// Register a dedicated test user
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
		// Best-effort cleanup in case the delete test did not run or failed
		if (userId && cookies) {
			await request(app.getHttpServer())
				.delete(`/users/${userId}`)
				.set('Cookie', cookies)
		}
		await app.close()
	}, 30000)

	it('should get a user', async () => {
		const res = await request(app.getHttpServer())
			.get(`/users/${userId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id', userId)
		expect(res.body).toHaveProperty('email')
	})

	it('should update a user', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/users/${userId}`)
			.set('Cookie', cookies)
			.send({
				name: 'User 1',
			})
			.expect(200)

		expect(res.body).toHaveProperty('id', userId)
	})

	it('should update a user password', async () => {
		const newPassword = 'NewPass1234.'

		const res = await request(app.getHttpServer())
			.patch(`/users/${userId}/password`)
			.set('Cookie', cookies)
			.send({
				currentPassword: testPassword,
				newPassword,
				confirmPassword: newPassword,
			})
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Password changed successfully')

		// Restore original password — JWT is stateless so old cookies still work
		await request(app.getHttpServer())
			.patch(`/users/${userId}/password`)
			.set('Cookie', cookies)
			.send({
				currentPassword: newPassword,
				newPassword: testPassword,
				confirmPassword: testPassword,
			})
			.expect(200)
	})

	it('should return 403 when accessing another user data', async () => {
		await request(app.getHttpServer())
			.get('/users/another-user-id')
			.set('Cookie', cookies)
			.expect(403)
	})

	it('should return 401 when unauthenticated', async () => {
		await request(app.getHttpServer()).get(`/users/${userId}`).expect(401)
	})

	it('should delete a user', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/users/${userId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Profile deleted successfully')
	})
})
