import type {
	ApexAxisChartSeries,
	ApexChart,
	ApexDataLabels,
	ApexFill,
	ApexGrid,
	ApexMarkers,
	ApexStroke,
	ApexTooltip,
	ApexXAxis,
	ApexYAxis,
} from 'ng-apexcharts'

export type BalanceChartOptions = {
	series: ApexAxisChartSeries
	chart: ApexChart
	xaxis: ApexXAxis
	yaxis: ApexYAxis
	stroke: ApexStroke
	tooltip: ApexTooltip
	dataLabels: ApexDataLabels
	fill: ApexFill
	grid: ApexGrid
	markers: ApexMarkers
	colors: string[]
}

export const MONTHS_PT = [
	'Jan',
	'Fev',
	'Mar',
	'Abr',
	'Mai',
	'Jun',
	'Jul',
	'Ago',
	'Set',
	'Out',
	'Nov',
	'Dez',
] as const

function getStep(value: number): number {
	return Math.abs(value) >= 100 ? 50 : 10
}

function roundDown(value: number): number {
	const step = getStep(value)
	return Math.floor(value / step) * step
}

function roundUp(value: number): number {
	const step = getStep(value)
	return Math.ceil(value / step) * step
}

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

export function createBalanceChartOptions(
	balanceData: number[],
	months: string[],
	isNegative: boolean,
): Partial<BalanceChartOptions> {
	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const chartColor = isNegative
		? getCssVar('--expense-foreground') || 'oklch(64.6% 0.222 41.116)'
		: getCssVar('--income-foreground') || 'oklch(0.60 0.13 163)'

	const formatValue = (value: number) => `€${value.toLocaleString()}`

	const maxValue = Math.max(...balanceData)
	const minValue = Math.min(...balanceData)
	const padding = (maxValue - minValue) * 0.15 || maxValue * 0.1

	return {
		series: [
			{
				name: 'Balance',
				data: balanceData,
			},
		],
		chart: {
			height: 250,
			type: 'area',
			toolbar: {
				show: false,
			},
			fontFamily: 'inherit',
			foreColor: foreground,
			background: 'transparent',
			sparkline: {
				enabled: false,
			},
		},
		colors: [chartColor],
		dataLabels: {
			enabled: false,
		},
		stroke: {
			curve: 'smooth',
			width: 3,
		},
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.3,
				opacityTo: 0.05,
				stops: [0, 100, 100],
			},
		},
		markers: {
			size: 4,
			strokeWidth: 2,
			hover: {
				size: 6,
			},
		},
		xaxis: {
			type: 'category',
			categories: months,
			labels: {
				style: {
					colors: foreground,
					fontSize: '12px',
				},
			},
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			min: roundDown(minValue - padding),
			max: roundUp(maxValue + padding),
			tickAmount: 4,
			labels: {
				style: {
					colors: foreground,
					fontSize: '12px',
				},
				formatter: (value: number) => {
					const rounded = Math.round(value)
					if (Math.abs(rounded) >= 10000) {
						return `${(rounded / 1000).toFixed(0)}k`
					}
					return `${rounded.toLocaleString()}`
				},
			},
		},
		grid: {
			show: false,
		},
		tooltip: {
			theme: 'dark',
			style: {
				fontSize: '12px',
			},
			y: {
				formatter: formatValue,
			},
		},
	}
}
