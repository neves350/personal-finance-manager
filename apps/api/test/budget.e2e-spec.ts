import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('BudgetController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
	let testEmail: string
	const testPassword = 'Test1234.'

	let budgetId: string
	let categoryId1: string
	let categoryId2: string
	let envelopeId1: string
	let envelopeId2: string

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		app.use(cookieParser())
		app.useGlobalPipes(new ValidationPipe({ transform: true }))
		await app.init()

		testEmail = `e2e-budget-${Date.now()}@example.com`
		const registerRes = await request(app.getHttpServer()).post('/users').send({
			name: 'E2E Budget Test',
			email: testEmail,
			password: testPassword,
		})

		cookies = registerRes.headers['set-cookie'] as unknown as string[]
		userId = registerRes.body.user.id

		const cat1Res = await request(app.getHttpServer())
			.post('/categories')
			.set('Cookie', cookies)
			.send({ title: 'Groceries', icon: 'shopping-cart', type: 'EXPENSE' })

		categoryId1 = cat1Res.body.category.id

		const cat2Res = await request(app.getHttpServer())
			.post('/categories')
			.set('Cookie', cookies)
			.send({ title: 'Transport', icon: 'car', type: 'EXPENSE' })

		categoryId2 = cat2Res.body.category.id
	}, 30000)

	afterAll(async () => {
		if (userId && cookies) {
			const budgets = await request(app.getHttpServer())
				.get('/budgets')
				.set('Cookie', cookies)

			for (const b of budgets.body ?? []) {
				await request(app.getHttpServer())
					.delete(`/budgets/${b.id}`)
					.set('Cookie', cookies)
			}

			await request(app.getHttpServer())
				.delete(`/users/${userId}`)
				.set('Cookie', cookies)
		}
		await app.close()
	}, 30000)

	it('should create a budget', async () => {
		const res = await request(app.getHttpServer())
			.post('/budgets')
			.set('Cookie', cookies)
			.send({ month: 6, year: 2026, note: 'June budget' })
			.expect(201)

		expect(res.body).toHaveProperty('budget')
		expect(res.body).toHaveProperty('message', 'Budget created successfully')
		expect(res.body.budget).toHaveProperty('month', 6)
		expect(res.body.budget).toHaveProperty('year', 2026)

		budgetId = res.body.budget.id
	})

	it('should reject duplicate budget for same month/year', async () => {
		await request(app.getHttpServer())
			.post('/budgets')
			.set('Cookie', cookies)
			.send({ month: 6, year: 2026 })
			.expect(409)
	})

	it('should reject invalid month', async () => {
		await request(app.getHttpServer())
			.post('/budgets')
			.set('Cookie', cookies)
			.send({ month: 13, year: 2026 })
			.expect(400)
	})

	it('should get all budgets', async () => {
		const res = await request(app.getHttpServer())
			.get('/budgets')
			.set('Cookie', cookies)
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
		expect(res.body.length).toBeGreaterThanOrEqual(1)
		expect(res.body[0]).toHaveProperty('month')
		expect(res.body[0]).toHaveProperty('year')
	})

	it('should get budget by month/year', async () => {
		const res = await request(app.getHttpServer())
			.get('/budgets/2026/6')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id', budgetId)
		expect(res.body).toHaveProperty('envelopes')
		expect(res.body).toHaveProperty('summary')
	})

	it('should return 404 for non-existent month/year', async () => {
		await request(app.getHttpServer())
			.get('/budgets/2020/1')
			.set('Cookie', cookies)
			.expect(404)
	})

	it('should update budget note', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/budgets/${budgetId}`)
			.set('Cookie', cookies)
			.send({ note: 'Updated June budget' })
			.expect(200)

		expect(res.body).toHaveProperty('budget')
		expect(res.body.budget).toHaveProperty('note', 'Updated June budget')
		expect(res.body).toHaveProperty('message', 'Budget updated successfully')
	})

	it('should add an envelope', async () => {
		const res = await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes`)
			.set('Cookie', cookies)
			.send({ categoryId: categoryId1, allocatedAmount: 300 })
			.expect(201)

		expect(res.body).toHaveProperty('envelope')
		expect(res.body).toHaveProperty('message', 'Envelope added successfully')
		expect(res.body.envelope).toHaveProperty('category')
		expect(res.body.envelope.category).toHaveProperty('title', 'Groceries')

		envelopeId1 = res.body.envelope.id
	})

	it('should add a second envelope', async () => {
		const res = await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes`)
			.set('Cookie', cookies)
			.send({ categoryId: categoryId2, allocatedAmount: 100 })
			.expect(201)

		envelopeId2 = res.body.envelope.id
	})

	it('should reject duplicate category envelope', async () => {
		await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes`)
			.set('Cookie', cookies)
			.send({ categoryId: categoryId1, allocatedAmount: 200 })
			.expect(409)
	})

	it('should reject INCOME category as envelope', async () => {
		const incomeCatRes = await request(app.getHttpServer())
			.post('/categories')
			.set('Cookie', cookies)
			.send({ title: 'Salary', icon: 'wallet', type: 'INCOME' })

		await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes`)
			.set('Cookie', cookies)
			.send({
				categoryId: incomeCatRes.body.category.id,
				allocatedAmount: 500,
			})
			.expect(400)
	})

	it('should update envelope allocation', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/budgets/${budgetId}/envelopes/${envelopeId1}`)
			.set('Cookie', cookies)
			.send({ allocatedAmount: 500 })
			.expect(200)

		expect(res.body).toHaveProperty('envelope')
		expect(res.body).toHaveProperty('message', 'Envelope updated successfully')
	})

	it('should transfer between envelopes', async () => {
		const res = await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes/transfer`)
			.set('Cookie', cookies)
			.send({
				fromEnvelopeId: envelopeId1,
				toEnvelopeId: envelopeId2,
				amount: 50,
			})
			.expect(201)

		expect(res.body).toHaveProperty('from')
		expect(res.body).toHaveProperty('to')
		expect(res.body).toHaveProperty(
			'message',
			'Transfer completed successfully',
		)
	})

	it('should reject transfer to same envelope', async () => {
		await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes/transfer`)
			.set('Cookie', cookies)
			.send({
				fromEnvelopeId: envelopeId1,
				toEnvelopeId: envelopeId1,
				amount: 50,
			})
			.expect(400)
	})

	it('should reject transfer exceeding allocation', async () => {
		await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/envelopes/transfer`)
			.set('Cookie', cookies)
			.send({
				fromEnvelopeId: envelopeId1,
				toEnvelopeId: envelopeId2,
				amount: 99999,
			})
			.expect(400)
	})

	it('should get budget with envelopes and summary', async () => {
		const res = await request(app.getHttpServer())
			.get('/budgets/2026/6')
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body.envelopes).toHaveLength(2)
		expect(res.body.envelopes[0]).toHaveProperty('allocatedAmount')
		expect(res.body.envelopes[0]).toHaveProperty('spentAmount')
		expect(res.body.envelopes[0]).toHaveProperty('remainingAmount')
		expect(res.body.envelopes[0]).toHaveProperty('progress')
		expect(res.body.envelopes[0]).toHaveProperty('status')
		expect(res.body.envelopes[0]).toHaveProperty('category')
		expect(res.body.summary).toHaveProperty('totalAllocated')
		expect(res.body.summary).toHaveProperty('totalSpent')
		expect(res.body.summary).toHaveProperty('totalRemaining')
		expect(res.body.summary).toHaveProperty('envelopeCount', 2)
	})

	it('should copy envelopes from previous month', async () => {
		const prevRes = await request(app.getHttpServer())
			.post('/budgets')
			.set('Cookie', cookies)
			.send({ month: 7, year: 2026, note: 'July budget' })

		const julyBudgetId = prevRes.body.budget.id

		const res = await request(app.getHttpServer())
			.post(`/budgets/${julyBudgetId}/copy-previous`)
			.set('Cookie', cookies)
			.expect(201)

		expect(res.body).toHaveProperty('envelopes')
		expect(res.body.envelopes).toHaveLength(2)
	})

	it('should reject copy when budget already has envelopes', async () => {
		await request(app.getHttpServer())
			.post(`/budgets/${budgetId}/copy-previous`)
			.set('Cookie', cookies)
			.expect(400)
	})

	it('should remove an envelope', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/budgets/${budgetId}/envelopes/${envelopeId2}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Envelope removed successfully')
	})

	it('should delete a budget', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/budgets/${budgetId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Budget deleted successfully')
	})

	it('should return 404 after budget is deleted', async () => {
		await request(app.getHttpServer())
			.get('/budgets/2026/6')
			.set('Cookie', cookies)
			.expect(404)
	})
})
