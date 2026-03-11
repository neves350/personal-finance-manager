export const mockPrisma = {
	user: {
		findUnique: jest.fn(),
		findFirst: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	},
	token: {
		create: jest.fn(),
		findUnique: jest.fn(),
		delete: jest.fn(),
	},
	bankAccount: {
		create: jest.fn(),
		findMany: jest.fn(),
		findFirst: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		aggregate: jest.fn(),
	},
	transaction: {
		count: jest.fn(),
		findMany: jest.fn(),
	},
	transfer: {
		count: jest.fn(),
		findMany: jest.fn(),
		aggregate: jest.fn(),
	},
	card: {
		count: jest.fn(),
	},
	$transaction: jest.fn(),
}
