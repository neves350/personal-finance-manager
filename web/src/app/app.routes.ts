import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, type Routes } from '@angular/router'
import { authGuard } from '@core/guards/auth.guard'
import { guestGuard } from '@core/guards/guest.guard'
import { BankAccountsService } from '@core/services/bank-accounts.service'
import { CardsService } from '@core/services/cards.service'
import { GoalsService } from '@core/services/goals.service'
import { Layout } from './shared/components/layout/layout'

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: 'full',
	},
	{
		path: 'login',
		title: 'Sign In',
		canActivate: [guestGuard],
		loadComponent: () =>
			import('./pages/auth/login/login').then((m) => m.Login),
	},
	{
		path: 'register',
		title: 'Sign Up',
		canActivate: [guestGuard],
		loadComponent: () =>
			import('./pages/auth/register/register').then((m) => m.Register),
	},
	{
		path: 'password/recover',
		title: 'Recover Password',
		canActivate: [guestGuard],
		loadComponent: () =>
			import('./pages/auth/password/recover/recover').then((m) => m.Recover),
	},
	{
		path: 'password/reset',
		title: 'Reset Password',
		canActivate: [guestGuard],
		loadComponent: () =>
			import('./pages/auth/password/reset/reset').then((m) => m.Reset),
	},
	{
		path: '',
		component: Layout,
		canActivate: [authGuard],
		children: [
			{
				path: 'dashboard',
				title: 'Dashboard',
				loadComponent: () =>
					import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
			},
			{
				path: 'transactions',
				title: 'Transactions',
				loadComponent: () =>
					import('./pages/transactions/transactions').then(
						(m) => m.Transactions,
					),
			},
			{
				path: 'recurrings',
				title: 'Recurrings',
				loadComponent: () =>
					import('./pages/recurrings/recurrings').then((m) => m.Recurrings),
			},
			{
				path: 'cards',
				title: 'Cards',
				loadComponent: () => import('./pages/cards/cards').then((m) => m.Cards),
			},
			{
				path: 'card-details/:id',
				title: 'Card Details',
				loadComponent: () =>
					import('./pages/cards/card-details/card-details').then(
						(m) => m.CardDetails,
					),
				resolve: {
					card: (route: ActivatedRouteSnapshot) => {
						return inject(CardsService).findById(route.params['id'])
					},
				},
			},
			{
				path: 'accounts',
				title: 'Accounts',
				loadComponent: () =>
					import('./pages/bank-account/bank-account').then(
						(m) => m.BankAccount,
					),
			},
			{
				path: 'connections',
				title: 'Connect Accounts',
				loadComponent: () =>
					import('./pages/connect-bank/connect-bank').then(
						(m) => m.ConnectBank,
					),
			},
			{
				path: 'account-details/:id',
				title: 'Account Details',
				loadComponent: () =>
					import('./pages/bank-account/account-details/account-details').then(
						(m) => m.AccountDetails,
					),
				resolve: {
					account: (route: ActivatedRouteSnapshot) => {
						return inject(BankAccountsService).findById(route.params['id'])
					},
				},
			},
			{
				path: 'categories',
				title: 'Categories',
				loadComponent: () =>
					import('./pages/categories/categories').then((m) => m.Categories),
			},
			{
				path: 'goals',
				title: 'Goals',
				loadComponent: () => import('./pages/goals/goals').then((m) => m.Goals),
			},
			{
				path: 'goal-details/:id',
				title: 'Goal Details',
				loadComponent: () =>
					import('./pages/goals/goals-details/goals-details').then(
						(m) => m.GoalsDetails,
					),
				resolve: {
					goal: (route: ActivatedRouteSnapshot) => {
						return inject(GoalsService).findById(route.params['id'])
					},
				},
			},
			{
				path: 'statistics',
				title: 'Statistics',
				loadComponent: () =>
					import('./pages/statistics/statistics').then((m) => m.Statistics),
			},
			{
				path: 'settings',
				title: 'Settings',
				loadComponent: () =>
					import('./pages/settings/settings').then((m) => m.Settings),
			},
		],
	},
	{
		path: '**',
		redirectTo: 'dashboard',
	},
]
