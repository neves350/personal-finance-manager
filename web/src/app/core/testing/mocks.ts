import { signal } from '@angular/core'
import { of } from 'rxjs'
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
	navigateByUrl: vi.fn(),
	createUrlTree: vi.fn(),
	serializeUrl: vi.fn().mockReturnValue(''),
}

/**
 * Bank Accounts
 */
export const mockBankAccounts = {
	bankAccounts: signal([]),
	totalBalance: signal(0),
	loading: signal(false),
	loadBankAccounts: vi.fn().mockReturnValue(of([])),
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
	categories: signal([]),
	hasCategories: vi.fn().mockReturnValue(false),
	expenseCategories: signal([]),
	incomeCategories: signal([]),
	loading: signal(false),
	loadCategories: vi.fn().mockReturnValue(of([])),
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
	cards: signal([]),
	hasCards: vi.fn().mockReturnValue(false),
	loading: signal(false),
	loadCards: vi.fn().mockReturnValue(of([])),
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
	transactions: signal([]),
	loading: signal(false),
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
	goals: signal([]),
	loading: signal(false),
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
	recurrings: signal([]),
	loading: signal(false),
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
 * Google Auth
 */
export const mockGoogleAuth = {
	signIn: vi.fn(),
}

/**
 * Notifications
 */
export const mockNotifications = {
	notifications: signal([]),
	unreadCount: signal(0),
	displayBadge: signal(''),
	findAll: vi.fn(),
	getUnreadCount: vi.fn(),
	markAsRead: vi.fn(),
	markAllAsRead: vi.fn(),
	delete: vi.fn(),
}
