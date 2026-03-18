import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { BankType } from 'src/generated/prisma/enums'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('BankAccountController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let accountId: string
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

	it('should post a account', async () => {
		const res = await request(app.getHttpServer())
			.post('/bank-account/')
			.set('Cookie', cookies)
			.send({
				name: 'Account 1',
				type: BankType.WALLET,
				balance: 100,
			})
			.expect(201)

		expect(res.body).toHaveProperty('bankAccount')
		expect(res.body).toHaveProperty(
			'message',
			'Bank account created successfull',
		)

		accountId = res.body.bankAccount.id
	})

	it('should get all accounts', async () => {
		const res = await request(app.getHttpServer())
			.get('/bank-account/')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
		expect(res.body).toHaveProperty('total')
		expect(res.body).toHaveProperty('count')
	})

	it('should get a account', async () => {
		const res = await request(app.getHttpServer())
			.get(`/bank-account/${accountId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body.card).toHaveProperty('id', accountId)
		expect(res.body).toHaveProperty('card')
	})

	it('should patch a account', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/bank-account/${accountId}`)
			.set('Cookie', cookies)
			.send({
				name: 'Account 2',
			})
			.expect(200)

		expect(res.body.updatedBankAccount).toHaveProperty('id', accountId)
		expect(res.body).toHaveProperty('updatedBankAccount')
	})

	it('should get balance history', async () => {
		const res = await request(app.getHttpServer())
			.get(`/bank-account/${accountId}/balance-history`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
	})

	it('should get recent movements', async () => {
		const res = await request(app.getHttpServer())
			.get(`/bank-account/${accountId}/recent-movements`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
	})

	it('should delete a account', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/bank-account/${accountId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty(
			'message',
			'Bank account deleted successfully',
		)
	})
})
