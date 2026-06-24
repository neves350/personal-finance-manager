import { vi } from 'vitest'

export const mockAuth = {
	login: vi.fn(),
	googleLogin: vi.fn(),
	register: vi.fn(),
	refresh: vi.fn(),
	getProfile: vi.fn(),
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

/**
 * Categories
 */
export const mockCategories = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}

/**
 * Cards
 */
export const mockCards = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	monthlyExpenses: vi.fn(),
	cashflow: vi.fn(),
	recentTransactions: vi.fn(),
	countByBankAccount: vi.fn(),
}

/**
 * Transactions
 */
export const mockTransactions = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}

/**
 * Goals
 */
export const mockGoals = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	addDeposit: vi.fn(),
	getDeposits: vi.fn(),
}

/**
 * Recurrings
 */
export const mockRecurrings = {
	findAll: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}

/**
 * Statistics
 */
export const mockStatistics = {
	getOverview: vi.fn(),
	getTrends: vi.fn(),
	getByCategory: vi.fn(),
	getDailyTotals: vi.fn(),
}

/**
 * Transfers
 */
export const mockTransfers = {
	findAll: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
}

/**
 * Notifications
 */
export const mockNotifications = {
	findAll: vi.fn(),
	getUnreadCount: vi.fn(),
	markAsRead: vi.fn(),
	markAllAsRead: vi.fn(),
	delete: vi.fn(),
}
