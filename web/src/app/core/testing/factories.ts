import { BankAccount, BankType } from '@core/api/bank-accounts.interface'
import { Card, CardColor, CardType } from '@core/api/cards.interface'
import { Category, CategoryType } from '@core/api/categories.interface'
import { Deposit } from '@core/api/deposits.interface'
import { Goal, GoalType } from '@core/api/goals.interface'
import {
	FrequencyType,
	Recurring,
	RecurringType,
} from '@core/api/recurrings.interface'
import { Transaction, TransactionType } from '@core/api/transactions.interface'
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

/**
 * Cards
 */
export function makeCard(overrides: Partial<Card> = {}): Card {
	return {
		id: 'card-1',
		name: 'Card 1',
		color: CardColor.BLUE,
		type: CardType.DEBIT_CARD,
		lastFour: '1234',
		expirationDate: '2026-01-01T00:00:00.000Z',
		cvc: '123',
		isLinked: false,
		cardNetwork: null,
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

/**
 * Transactions
 */
export function makeTransaction(
	overrides: Partial<Transaction> = {},
): Transaction {
	return {
		id: 'transaction-1',
		cardId: 'card-1',
		bankAccountId: 'bankAccount-1',
		categoryId: 'category-1',
		title: 'Transaction 1',
		type: TransactionType.EXPENSE,
		amount: 100,
		date: new Date(),
		category: {
			id: 'category-1',
			title: 'Category 1',
			icon: 'phone',
			type: CategoryType.EXPENSE,
		},
		isPaid: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

/**
 * Goals
 */
export function makeGoal(overrides: Partial<Goal> = {}): Goal {
	return {
		id: 'goal-1',
		title: 'Goal 1',
		amount: 500,
		currentAmount: 100,
		type: GoalType.SAVINGS,
		startDate: '2026-01-01T00:00:00.000Z',
		progress: 60,
		isCompleted: false,
		paceStatus: 'ON_TRACK',
		breakdown: {
			daily: 10,
			weekly: 70,
			monthly: 280,
			daysRemaining: 20,
		},
		category: {
			id: 'c-1',
			title: 'Category 1',
			icon: 'text',
			type: CategoryType.EXPENSE,
		},
		bankAccount: {
			id: 'b-1',
			name: 'Bank Account 1',
			type: BankType.CHECKING,
		},
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

/**
 * Deposit
 */
export function makeDeposit(overrides: Partial<Deposit> = {}): Deposit {
	return {
		id: 'deposit-1',
		goalId: 'goal-1',
		amount: 100,
		date: '2026-01-01T00:00:00.000Z',
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

/**
 * Recurrings
 */
export function makeRecurring(overrides: Partial<Recurring> = {}): Recurring {
	return {
		id: 'recurring-1',
		cardId: 'card-1',
		bankAccountId: 'account-1',
		categoryId: 'category-1',
		type: RecurringType.INCOME,
		description: 'Recurring 1',
		amount: 100,
		monthDay: 28,
		frequency: FrequencyType.MONTH,
		startDate: new Date(),
		category: {
			id: 'category-1',
			title: 'Category 1',
			type: CategoryType.INCOME,
		},
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}
