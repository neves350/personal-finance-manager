import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { BankType } from 'src/generated/prisma/enums'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('TransferController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let transferId: string
	let fromAccountId: string
	let toAccountId: string
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

		const fromAccountRes = await request(app.getHttpServer())
			.post('/bank-account/')
			.set('Cookie', cookies)
			.send({
				name: 'Test Bank Account 1',
				type: BankType.CHECKING,
				balance: 100,
			})

		fromAccountId = fromAccountRes.body.bankAccount.id

		const toAccountRes = await request(app.getHttpServer())
			.post('/bank-account/')
			.set('Cookie', cookies)
			.send({
				name: 'Test Bank Account 2',
				type: BankType.CHECKING,
				balance: 50,
			})

		toAccountId = toAccountRes.body.bankAccount.id
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

	it('should post a transfer', async () => {
		const res = await request(app.getHttpServer())
			.post('/transfer/')
			.set('Cookie', cookies)
			.send({
				amount: 100,
				fromAccountId,
				toAccountId,
				date: new Date('2026-03-18'),
			})
			.expect(201)

		expect(res.body).toHaveProperty('transfer')
		expect(res.body).toHaveProperty(
			'message',
			'Transfer completed successfully',
		)

		transferId = res.body.transfer.id
	})

	it('should get all transfers', async () => {
		const res = await request(app.getHttpServer())
			.get('/transfer/')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
		expect(res.body).toHaveProperty('count')
		expect(res.body).toHaveProperty('limit')
		expect(res.body).toHaveProperty('offset')
	})

	it('should get a transfer', async () => {
		const res = await request(app.getHttpServer())
			.get(`/transfer/${transferId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('transfer')
		expect(res.body.transfer).toHaveProperty('id', transferId)
	})
})
