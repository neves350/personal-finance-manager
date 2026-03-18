import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { BankType, CardColor, CardType } from 'src/generated/prisma/enums'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('CardController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let cardId: string
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

		// create a account to link the card
		const accountRes = await request(app.getHttpServer())
			.post('/bank-account/')
			.set('Cookie', cookies)
			.send({
				name: 'Test Bank Account',
				type: BankType.CHECKING,
				balance: 1000,
			})

		accountId = accountRes.body.bankAccount.id
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

	it('should post a card', async () => {
		const res = await request(app.getHttpServer())
			.post('/cards/')
			.set('Cookie', cookies)
			.send({
				name: 'Card 1',
				bankAccountId: accountId,
				color: CardColor.BLUE,
				type: CardType.DEBIT_CARD,
				lastFour: '1234',
				expirationDate: '05/26',
				cvc: '123',
			})
			.expect(201)

		expect(res.body).toHaveProperty('card')
		expect(res.body).toHaveProperty('message', 'Card created successfull')

		cardId = res.body.card.id
	})

	it('should get all cards', async () => {
		const res = await request(app.getHttpServer())
			.get('/cards/')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('cards')
		expect(res.body).toHaveProperty('total')
		expect(res.body.cards.some((c: { id: string }) => c.id === cardId)).toBe(
			true,
		)
	})

	it('should get a card', async () => {
		const res = await request(app.getHttpServer())
			.get(`/cards/${cardId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('card')
		expect(res.body.card).toHaveProperty('id', cardId)
	})

	it('should patch a card', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/cards/${cardId}`)
			.set('Cookie', cookies)
			.send({
				name: 'Card 2',
			})
			.expect(200)

		expect(res.body).toHaveProperty('updatedCard')
		expect(res.body.updatedCard).toHaveProperty('id', cardId)
	})

	it('should get card recent transactions', async () => {
		const res = await request(app.getHttpServer())
			.get(`/cards/${cardId}/transactions`)
			.set('Cookie', cookies)
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
	})

	it('should get card cashflow', async () => {
		const res = await request(app.getHttpServer())
			.get(`/cards/${cardId}/cashflow`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('data')
	})

	it('should delete a card', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/cards/${cardId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Card deleted successfully')
	})
})
