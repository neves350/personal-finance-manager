import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { GoalType } from 'src/generated/prisma/enums'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('GoalController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let goalId: string
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
		// Best-effort cleanup in case the delete test did not run or failed
		if (userId && cookies) {
			await request(app.getHttpServer())
				.delete(`/users/${userId}`)
				.set('Cookie', cookies)
		}
		await app.close()
	}, 30000)

	it('should post a goal', async () => {
		const res = await request(app.getHttpServer())
			.post('/goals/')
			.set('Cookie', cookies)
			.send({
				title: 'Goal 1',
				amount: 100,
				type: GoalType.SAVINGS,
				startDate: new Date('2026-03-18'),
			})
			.expect(201)

		expect(res.body).toHaveProperty('goal')
		expect(res.body).toHaveProperty('message', 'Goal created successfull')

		goalId = res.body.goal.id
	})

	it('should get all goals', async () => {
		const res = await request(app.getHttpServer())
			.get('/goals/')
			.set('Cookie', cookies)
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
	})

	it('should get a goal', async () => {
		const res = await request(app.getHttpServer())
			.get(`/goals/${goalId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id', goalId)
	})

	it('should patch a goal', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/goals/${goalId}`)
			.set('Cookie', cookies)
			.send({
				title: 'Goal 2',
			})
			.expect(200)

		expect(res.body).toHaveProperty('goal')
		expect(res.body.goal).toHaveProperty('id', goalId)
		expect(res.body).toHaveProperty('message', 'Goal updated successfull')
	})

	it('should post a deposit', async () => {
		const res = await request(app.getHttpServer())
			.post(`/goals/${goalId}/deposit`)
			.set('Cookie', cookies)
			.send({
				amount: 50,
			})
			.expect(201)

		expect(res.body).toHaveProperty('deposit')
		expect(res.body).toHaveProperty('goal')
		expect(res.body).toHaveProperty('message', 'Deposit added successfully')
	})

	it('should get all deposits', async () => {
		const res = await request(app.getHttpServer())
			.get(`/goals/${goalId}/deposits`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('deposits')
		expect(res.body).toHaveProperty('totalDeposits')
	})

	it('should delete a goal', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/goals/${goalId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Goal deleted successfully')
	})
})
