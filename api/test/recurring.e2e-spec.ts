import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { BankType } from 'src/generated/prisma/enums'
import { CategoryType } from 'src/modules/category/dtos/query-category.dto'
import {
	FrequencyType,
	RecurringType,
} from 'src/modules/recurring/dtos/create-recurring.dto'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('RecurringController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let recurringId: string
	let bankAccountId: string
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

		bankAccountId = accountRes.body.bankAccount.id

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

	it('should post a recurring', async () => {
		const res = await request(app.getHttpServer())
			.post('/recurring/')
			.set('Cookie', cookies)
			.send({
				type: RecurringType.EXPENSE,
				description: 'Recurring 1',
				amount: 10,
				frequency: FrequencyType.MONTH,
				startDate: new Date('2026-03-18'),
				bankAccountId,
				categoryId,
			})
			.expect(201)

		expect(res.body).toHaveProperty('recurring')
		expect(res.body).toHaveProperty(
			'message',
			'Recurring transaction create successfull',
		)

		recurringId = res.body.recurring.id
	})

	it('should get all recurrings', async () => {
		const res = await request(app.getHttpServer())
			.get('/recurring/')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('recurrings')
		expect(res.body).toHaveProperty('total')
	})

	it('should patch a recurring', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/recurring/${recurringId}`)
			.set('Cookie', cookies)
			.send({
				description: 'Recurring 2',
			})
			.expect(200)

		expect(res.body).toHaveProperty('id', recurringId)
	})

	it('should delete a recurring', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/recurring/${recurringId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty(
			'message',
			'Recurring transaction deleted successfully',
		)
	})
})
