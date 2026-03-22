import type { StatisticsTrends } from '@core/api/statistics.interface'
import type {
	ApexAxisChartSeries,
	ApexChart,
	ApexDataLabels,
	ApexGrid,
	ApexLegend,
	ApexPlotOptions,
	ApexResponsive,
	ApexTooltip,
	ApexXAxis,
	ApexYAxis,
} from 'ng-apexcharts'

export type GroupedBarChartOptions = {
	series: ApexAxisChartSeries
	chart: ApexChart
	xaxis: ApexXAxis
	yaxis: ApexYAxis
	colors: string[]
	legend: ApexLegend
	plotOptions: ApexPlotOptions
	dataLabels: ApexDataLabels
	tooltip: ApexTooltip
	grid: ApexGrid
	responsive: ApexResponsive[]
}

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

export function createGroupedBarOptions(
	trends: StatisticsTrends,
): Partial<GroupedBarChartOptions> {
	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const mutedForeground =
		getCssVar('--muted-foreground') || 'oklch(0.55 0.02 264)'
	const borderColor = getCssVar('--border') || 'oklch(0.88 0.02 264)'
	const primary = getCssVar('--primary') || 'oklch(0.6 0.118 184.704)'
	const previousColor = `color-mix(in oklch, ${mutedForeground} 30%, transparent)`

	return {
		series: [
			{
				name: `Previous (${trends.previous.period})`,
				data: [
					trends.previous.income,
					trends.previous.expenses,
					trends.previous.balance,
				],
			},
			{
				name: `Current (${trends.current.period})`,
				data: [
					trends.current.income,
					trends.current.expenses,
					trends.current.balance,
				],
			},
		],
		chart: {
			type: 'bar',
			height: 350,
			fontFamily: 'inherit',
			foreColor: foreground,
			background: 'transparent',
			toolbar: { show: false },
		},
		colors: [previousColor, primary],
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '40%',
				borderRadius: 5,
				borderRadiusApplication: 'end',
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories: ['Income', 'Expenses', 'Balance'],
			labels: {
				style: {
					colors: mutedForeground,
					fontSize: '13px',
				},
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				style: {
					colors: mutedForeground,
					fontSize: '12px',
				},
				formatter: (value: number) => {
					if (value >= 1000) return `€${(value / 1000).toFixed(1)}k`
					return `€${value}`
				},
			},
		},
		grid: {
			borderColor,
			strokeDashArray: 4,
			padding: {
				left: 8,
				right: 8,
			},
		},
		legend: {
			position: 'top',
			horizontalAlign: 'right',
			fontSize: '13px',
			labels: {
				colors: foreground,
			},
			markers: {
				shape: 'circle',
				strokeWidth: 0,
				offsetX: -4,
			},
			itemMargin: {
				horizontal: 12,
			},
		},
		tooltip: {
			theme: 'dark',
			style: {
				fontSize: '12px',
			},
			y: {
				formatter: (value: number) =>
					`€${value.toLocaleString('pt-PT', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`,
			},
		},
		responsive: [
			{
				breakpoint: 480,
				options: {
					chart: {
						height: 250,
					},
					plotOptions: {
						bar: {
							columnWidth: '65%',
						},
					},
				},
			},
		],
	}
}
