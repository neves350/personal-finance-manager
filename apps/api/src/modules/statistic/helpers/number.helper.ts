export class NumberHelper {
	static toNumber(value: any): number {
		return value ? Number(value) : 0
	}

	static round(value: number, decimals: number = 2): number {
		const multiplier = 10 ** decimals
		return Math.round(value * multiplier) / multiplier
	}
}
