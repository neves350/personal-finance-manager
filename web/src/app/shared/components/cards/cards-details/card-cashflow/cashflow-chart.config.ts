import type { ChartOptions } from '@/shared/components/dashboard/dashboard-chart/transaction-chart/transaction-chart.config'

export function createCashflowChartOptions(
	incomeData: number[],
	expenseData: number[],
	months: string[],
): Partial<ChartOptions> {
	const getCssVar = (name: string) =>
		getComputedStyle(document.documentElement).getPropertyValue(name).trim()

	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const border = getCssVar('--border') || 'oklch(0.92 0.004 286.32)'
	const incomeColor = getCssVar('--income-foreground') || 'oklch(0.60 0.13 163)'
	const expenseColor =
		getCssVar('--expense-foreground') || 'oklch(64.6% 0.222 41.116)'

	return {
		series: [
			{ name: 'Income', data: incomeData },
			{ name: 'Expenses', data: expenseData },
		],
		chart: {
			type: 'area',
			height: 300,
			toolbar: { show: false },
			fontFamily: 'inherit',
			foreColor: foreground,
			background: 'transparent',
		},
		colors: [incomeColor, expenseColor],
		dataLabels: { enabled: false },
		stroke: { curve: 'smooth', width: 3 },
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.1,
				stops: [0, 90, 100],
			},
		},
		markers: {
			size: 4,
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
