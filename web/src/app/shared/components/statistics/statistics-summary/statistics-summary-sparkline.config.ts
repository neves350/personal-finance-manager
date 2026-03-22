import type {
	ApexChart,
	ApexDataLabels,
	ApexGrid,
	ApexStroke,
	ApexTooltip,
	ApexXAxis,
	ApexYAxis,
} from 'ng-apexcharts'

export type SparklineChartOptions = {
	series: ApexAxisChartSeries
	chart: ApexChart
	stroke: ApexStroke
	xaxis: ApexXAxis
	yaxis: ApexYAxis
	grid: ApexGrid
	dataLabels: ApexDataLabels
	tooltip: ApexTooltip
	colors: string[]
}

type ApexAxisChartSeries = {
	name?: string
	data: number[]
}[]

function formatLabel(label: string): string {
	if (!label) return ''
	const date = new Date(label)
	if (Number.isNaN(date.getTime())) return label
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

export function createSparklineChartOptions(
	data: number[],
	cssVar: string,
	labels?: string[],
	name?: string,
): Partial<SparklineChartOptions> {
	const color = getCssVar(cssVar) || 'oklch(0.577 0.245 27.325)'

	return {
		series: [
			{
				name,
				data: data,
			},
		],
		chart: {
			type: 'line',
			height: 40,
			width: 100,
			sparkline: {
				enabled: true,
			},
			animations: {
				enabled: true,
			},
		},
		colors: [color],
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		xaxis: {
			categories: labels?.map(formatLabel),
			labels: {
				show: false,
			},
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		yaxis: {
			labels: {
				show: false,
			},
		},
		grid: {
			show: false,
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			enabled: true,
			theme: 'dark',
			x: {
				show: !!labels,
			},
			y: {
				formatter: (val: number) => `€${val.toFixed(0)}`,
			},
		},
	}
}
