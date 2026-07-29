import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'
import { PrismaClient } from '../../api/src/generated/prisma/client'

const connectionString =
	process.env.DATABASE_URL ??
	'postgresql://test:test@localhost:5433/expenses_test'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export const TEST_USER = {
	email: 'test@example.com',
	password: 'password123',
	name: 'Test User',
}

export async function seed() {
	const passwordHash = await bcrypt.hash(TEST_USER.password, 10)

	const user = await prisma.user.create({
		data: {
			email: TEST_USER.email,
			name: TEST_USER.name,
			passwordHash,
		},
	})

	const account = await prisma.bankAccount.create({
		data: {
			userId: user.id,
			name: 'Test Checking',
			type: 'CHECKING',
			balance: 1000,
			initialBalance: 1000,
		},
	})

	const [expenseCategory, incomeCategory] = await Promise.all([
		prisma.category.create({
			data: {
				userId: user.id,
				title: 'Groceries',
				icon: 'shopping-cart',
				type: 'EXPENSE',
			},
		}),
		prisma.category.create({
			data: {
				userId: user.id,
				title: 'Salary',
				icon: 'briefcase',
				type: 'INCOME',
			},
		}),
	])

	const now = new Date()

	await prisma.transaction.createMany({
		data: [
			{
				bankAccountId: account.id,
				categoryId: expenseCategory.id,
				title: 'Weekly groceries',
				type: 'EXPENSE',
				amount: 45.5,
				date: now,
			},
			{
				bankAccountId: account.id,
				categoryId: expenseCategory.id,
				title: 'Supermarket run',
				type: 'EXPENSE',
				amount: 32.0,
				date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
			},
			{
				bankAccountId: account.id,
				categoryId: incomeCategory.id,
				title: 'Monthly salary',
				type: 'INCOME',
				amount: 2500.0,
				date: new Date(now.getFullYear(), now.getMonth(), 1),
			},
		],
	})

	console.log('Test database seeded')
}

export async function cleanup() {
	const tables = [
		'transactions',
		'recurrings',
		'cards',
		'goals',
		'deposits',
		'transfers',
		'categories',
		'bank_accounts',
		'tokens',
		'notifications',
		'budgets',
		'envelopes',
		'users',
	]
	for (const table of tables) {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`)
	}
}

export async function disconnect() {
	await prisma.$disconnect()
}

if (require.main === module) {
	seed()
		.catch((e) => {
			console.error(e)
			process.exit(1)
		})
		.finally(disconnect)
}
