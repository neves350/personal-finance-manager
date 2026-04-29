import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import { Category, CategoryType } from '@core/api/categories.interface'
import { User } from '@core/api/users.interface'
import { AuthResponse } from '@core/types/auth-response.type'

export function makeUser(overrides: Partial<User> = {}): User {
	return {
		id: '1',
		name: 'User 1',
		email: 'user@example.com',
		avatarUrl: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

export function makeAuthResponse(user?: User): AuthResponse {
	return {
		message: 'Success',
		user,
	}
}

/**
 * Bank Accounts
 */
export function makeBankAccount(
	overrides: Partial<BankAccount> = {},
): BankAccount {
	return {
		id: '1',
		name: 'Bank Account 1',
		type: BankType.WALLET,
		balance: 100,
		initialBalance: 100,
		totalMovements: 1,
		isLinked: true,
		isCardAccount: false,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

/**
 * Categories
 */
export function makeCategory(overrides: Partial<Category> = {}): Category {
	return {
		id: 'category-1',
		title: 'Category 1',
		icon: 'phone',
		color: 'BLUE',
		isDefault: false,
		type: CategoryType.EXPENSE,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}
