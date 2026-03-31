import { Type } from 'src/generated/prisma/client'

export const Categories = [
	/**
	 * INCOMES
	 */
	{
		icon: 'briefcase',
		title: 'Salary',
		type: Type.INCOME,
		color: 'oklch(0.723 0.219 142.5)',
	},
	{
		icon: 'chart-no-axes-combined',
		title: 'Investments',
		type: Type.INCOME,
		color: 'oklch(0.623 0.214 259.1)',
	},
	{
		icon: 'shopping-bag',
		title: 'Sales',
		type: Type.INCOME,
		color: 'oklch(0.769 0.188 70.1)',
	},
	{
		icon: 'gift',
		title: 'Gifts',
		type: Type.INCOME,
		color: 'oklch(0.718 0.202 349.8)',
	},
	{
		icon: 'rotate-ccw',
		title: 'Refund',
		type: Type.INCOME,
		color: 'oklch(0.704 0.14 182.5)',
	},
	{
		icon: 'tag',
		title: 'Others',
		type: Type.INCOME,
		color: 'oklch(0.555 0.011 286.1)',
	},

	/**
	 * EXPENSES
	 */
	{
		icon: 'utensils',
		title: 'Food & Dining',
		type: Type.EXPENSE,
		color: 'oklch(0.705 0.191 47.6)',
	},
	{
		icon: 'house',
		title: 'Housing',
		type: Type.EXPENSE,
		color: 'oklch(0.623 0.214 259.1)',
	},
	{
		icon: 'car',
		title: 'Transportation',
		type: Type.EXPENSE,
		color: 'oklch(0.606 0.224 292.6)',
	},
	{
		icon: 'joystick',
		title: 'Entertainment',
		type: Type.EXPENSE,
		color: 'oklch(0.718 0.202 349.8)',
	},
	{
		icon: 'bandage',
		title: 'Healthcare',
		type: Type.EXPENSE,
		color: 'oklch(0.628 0.257 29.2)',
	},
	{
		icon: 'shopping-basket',
		title: 'Shopping',
		type: Type.EXPENSE,
		color: 'oklch(0.769 0.188 70.1)',
	},
	{
		icon: 'graduation-cap',
		title: 'Education',
		type: Type.EXPENSE,
		color: 'oklch(0.715 0.143 215.3)',
	},
	{
		icon: 'shirt',
		title: 'Clothes',
		type: Type.EXPENSE,
		color: 'oklch(0.627 0.265 303.9)',
	},
	{
		icon: 'paw-print',
		title: 'Pets',
		type: Type.EXPENSE,
		color: 'oklch(0.726 0.177 162.1)',
	},
	{
		icon: 'gift',
		title: 'Gifts',
		type: Type.EXPENSE,
		color: 'oklch(0.645 0.246 16.4)',
	},
	{
		icon: 'repeat-2',
		title: 'Subscriptions',
		type: Type.EXPENSE,
		color: 'oklch(0.585 0.233 277.1)',
	},
	{
		icon: 'circle-dollar-sign',
		title: 'Taxes',
		type: Type.EXPENSE,
		color: 'oklch(0.705 0.191 47.6)',
	},
	{
		icon: 'tag',
		title: 'Others',
		type: Type.EXPENSE,
		color: 'oklch(0.555 0.011 286.1)',
	},
]
