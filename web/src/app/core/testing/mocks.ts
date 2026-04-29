import { vi } from 'vitest'

export const mockAuth = {
	login: vi.fn(),
	googleLogin: vi.fn(),
	register: vi.fn(),
	refresh: vi.fn(),
	loadProfile: vi.fn(),
	verifyAuth: vi.fn(),
	requestPasswordRecover: vi.fn(),
	resetPassword: vi.fn(),
	logout: vi.fn(),
	clearAuth: vi.fn(),
	isAuthenticated: vi.fn(),
}

/**
 * Router
 */
export const mockRouter = {
	navigate: vi.fn(),
}

/**
 * Bank Accounts
 */
export const mockBankAccounts = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	getBalanceHistory: vi.fn(),
}
