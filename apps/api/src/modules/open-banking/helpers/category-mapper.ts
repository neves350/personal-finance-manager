/**
 * Maps Salt Edge transaction categories to our app's default category titles.
 *
 * Salt Edge returns categories like "food_and_groceries", "transport", etc.
 * We map these to the closest matching default category title in our system.
 */

const EXPENSE_CATEGORY_MAP: Record<string, string> = {
	// Food
	food_and_groceries: 'Food & Dining',
	restaurants_and_bars: 'Food & Dining',
	cafes_and_restaurants: 'Food & Dining',
	groceries: 'Food & Dining',

	// Housing
	housing: 'Housing',
	rent: 'Housing',
	mortgage: 'Housing',
	utilities: 'Housing',
	home: 'Housing',

	// Transport
	transport: 'Transportation',
	transportation: 'Transportation',
	car: 'Transportation',
	fuel: 'Transportation',
	taxi: 'Transportation',
	public_transport: 'Transportation',

	// Entertainment
	entertainment: 'Entertainment',
	leisure: 'Entertainment',
	sport: 'Entertainment',
	hobbies: 'Entertainment',
	gambling: 'Entertainment',
	movies_and_music: 'Entertainment',

	// Health
	healthcare: 'Healthcare',
	health: 'Healthcare',
	medicine: 'Healthcare',
	pharmacy: 'Healthcare',

	// Shopping
	shopping: 'Shopping',
	electronics: 'Shopping',
	online_shopping: 'Shopping',

	// Education
	education: 'Education',
	books: 'Education',

	// Clothes
	clothes: 'Clothes',
	clothing: 'Clothes',

	// Pets
	pets: 'Pets',

	// Gifts
	gifts: 'Gifts',
	donations: 'Gifts',
	charity: 'Gifts',

	// Subscriptions
	subscriptions: 'Subscriptions',
	software: 'Subscriptions',
	internet: 'Subscriptions',
	phone: 'Subscriptions',

	// Taxes
	taxes: 'Taxes',
	insurance: 'Taxes',
	fees: 'Taxes',
}

const INCOME_CATEGORY_MAP: Record<string, string> = {
	salary: 'Salary',
	wages: 'Salary',
	investments: 'Investments',
	dividends: 'Investments',
	interest: 'Investments',
	sales: 'Sales',
	refund: 'Refund',
	refunds: 'Refund',
	cashback: 'Refund',
	gifts: 'Gifts',
}

/**
 * Returns the matching category title for a Salt Edge transaction category.
 * Falls back to "Others" if no match is found.
 */
export function mapSaltEdgeCategory(
	saltEdgeCategory: string,
	isIncome: boolean,
): string {
	const normalized = saltEdgeCategory.toLowerCase().replace(/\s+/g, '_')

	if (isIncome) {
		return INCOME_CATEGORY_MAP[normalized] ?? 'Others'
	}

	return EXPENSE_CATEGORY_MAP[normalized] ?? 'Others'
}
