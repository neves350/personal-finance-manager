import type {
	ApexAxisChartSeries,
	ApexChart,
	ApexDataLabels,
	ApexFill,
	ApexGrid,
	ApexLegend,
	ApexMarkers,
	ApexStroke,
	ApexTooltip,
	ApexXAxis,
	ApexYAxis,
} from 'ng-apexcharts'

export type ChartOptions = {
	series: ApexAxisChartSeries
	chart: ApexChart
	xaxis: ApexXAxis
	yaxis: ApexYAxis
	stroke: ApexStroke
	tooltip: ApexTooltip
	dataLabels: ApexDataLabels
	fill: ApexFill
	grid: ApexGrid
	legend: ApexLegend
	markers: ApexMarkers
	colors: string[]
}

export const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
] as const

export function createCashflowChartOptions(
	incomeData: number[],
	expenseData: number[],
	months: string[],
): Partial<ChartOptions> {
	const getCssVar = (name: string) =>
		getComputedStyle(document.documentElement).getPropertyValue(name).trim()

	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const border = getCssVar('--border') || 'oklch(0.92 0.004 286.32)'

	return {
		series: [
			{ name: 'Income', data: incomeData },
			{ name: 'Expenses', data: expenseData },
		],
		chart: {
			type: 'area',
			height: 300,
			toolbar: { show: false },
			fontFamily: 'Inter, sans-serif',
			foreColor: foreground,
			background: 'transparent',
		},
		colors: ['hsl(160, 84%, 39%)', 'hsl(0, 72%, 51%)'],
		dataLabels: { enabled: false },
		stroke: { curve: 'smooth', width: 2 },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.3,
				opacityTo: 0,
				stops: [0, 100],
			},
		},
		markers: {
			size: 3,
			strokeWidth: 2,
			hover: { size: 6 },
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
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				style: {
					colors: foreground,
					fontSize: '12px',
				},
				formatter: (value: number) => `€${value.toLocaleString()}`,
			},
		},
		grid: {
			borderColor: border,
			strokeDashArray: 4,
			xaxis: {
				lines: { show: false },
			},
		},
		legend: {
			position: 'top',
			horizontalAlign: 'right',
			fontSize: '14px',
			labels: {
				colors: foreground,
			},
			markers: {
				offsetX: -4,
				customHTML: () =>
					'<span style="display:inline-block;width:3px;height:12px;background:currentColor;vertical-align:middle;margin:0 6px;"></span>',
			},
			itemMargin: {
				horizontal: 12,
			},
		},
		tooltip: {
			theme: 'dark',
			style: { fontSize: '12px' },
			y: {
				formatter: (value: number) => `€${value.toLocaleString()}`,
			},
		},
	}
}
