import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { BankType } from 'src/generated/prisma/enums'
import { CategoryType } from 'src/modules/category/dtos/query-category.dto'
import { TransactionType } from 'src/modules/transaction/dtos/query-transaction.dto'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('TransactionController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let transactionId: string
	let accountId: string
	let categoryId: string
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

		const accountRes = await request(app.getHttpServer())
			.post('/bank-account/')
			.set('Cookie', cookies)
			.send({
				name: 'Test Bank Account',
				type: BankType.CHECKING,
				balance: 1000,
			})

		accountId = accountRes.body.bankAccount.id

		const categoryRes = await request(app.getHttpServer())
			.post('/categories/')
			.set('Cookie', cookies)
			.send({
				title: 'Test Category',
				icon: 'tag',
				type: CategoryType.EXPENSE,
			})

		categoryId = categoryRes.body.category.id
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

	it('should post a transaction', async () => {
		const res = await request(app.getHttpServer())
			.post('/transactions/')
			.set('Cookie', cookies)
			.send({
				title: 'Transaction 1',
				type: TransactionType.EXPENSE,
				amount: 100,
				date: new Date('2026-03-18'),
				bankAccountId: accountId,
				categoryId: categoryId,
			})
			.expect(201)

		expect(res.body).toHaveProperty('transaction')
		expect(res.body).toHaveProperty(
			'message',
			'Transaction created successfull',
		)

		transactionId = res.body.transaction.id
	})

	it('should get all transactions', async () => {
		const res = await request(app.getHttpServer())
			.get('/transactions/')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
		expect(res.body).toHaveProperty('meta')
	})

	it('should get a transaction', async () => {
		const res = await request(app.getHttpServer())
			.get(`/transactions/${transactionId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id', transactionId)
	})

	it('should patch a transaction', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/transactions/${transactionId}`)
			.set('Cookie', cookies)
			.send({
				title: 'Transaction 2',
			})
			.expect(200)

		expect(res.body).toHaveProperty('id', transactionId)
	})

	it('should delete a transaction', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/transactions/${transactionId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty(
			'message',
			'Transaction deleted successfully',
		)
	})
})
