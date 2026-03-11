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
	$transaction: jest.fn(),
}
