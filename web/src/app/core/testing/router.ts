import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

export function makeActivatedRouteSnapshot(
	overrides: Partial<ActivatedRouteSnapshot> = {},
): ActivatedRouteSnapshot {
	return {
		params: {},
		queryParams: {},
		data: {},
		url: [],
		...overrides,
	} as ActivatedRouteSnapshot
}

export function makeRouterStateSnapshot(
	url = '/',
	overrides: Partial<RouterStateSnapshot> = {},
): RouterStateSnapshot {
	return {
		url,
		...overrides,
	} as RouterStateSnapshot
}
