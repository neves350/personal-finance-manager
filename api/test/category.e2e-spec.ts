import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { CategoryType } from 'src/modules/category/dtos/query-category.dto'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'

describe('CategoryController (e2e)', () => {
	let app: INestApplication<App>
	let cookies: string[]
	let userId: string
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

	it('should post a category', async () => {
		const res = await request(app.getHttpServer())
			.post('/categories/')
			.set('Cookie', cookies)
			.send({
				title: 'Category 1',
				icon: 'tag',
				type: CategoryType.EXPENSE,
			})
			.expect(201)

		expect(res.body).toHaveProperty('category')
		expect(res.body).toHaveProperty('message', 'Category created successfull')

		categoryId = res.body.category.id
	})

	it('should get all categories', async () => {
		const res = await request(app.getHttpServer())
			.get('/categories/')
			.set('Cookie', cookies)
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
	})

	it('should get all categories filtered by type', async () => {
		const res = await request(app.getHttpServer())
			.get('/categories/')
			.query({ type: CategoryType.EXPENSE })
			.set('Cookie', cookies)
			.expect(200)

		expect(Array.isArray(res.body)).toBe(true)
		expect(
			res.body.every((c: { type: string }) => c.type === CategoryType.EXPENSE),
		).toBe(true)
	})

	it('should get a category', async () => {
		const res = await request(app.getHttpServer())
			.get(`/categories/${categoryId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('id', categoryId)
	})

	it('should patch a category', async () => {
		const res = await request(app.getHttpServer())
			.patch(`/categories/${categoryId}`)
			.set('Cookie', cookies)
			.send({
				title: 'Category 2',
			})
			.expect(200)

		expect(res.body).toHaveProperty('id', categoryId)
	})

	it('should delete a category', async () => {
		const res = await request(app.getHttpServer())
			.delete(`/categories/${categoryId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(res.body).toHaveProperty('message', 'Category deleted successfully')
	})
})
