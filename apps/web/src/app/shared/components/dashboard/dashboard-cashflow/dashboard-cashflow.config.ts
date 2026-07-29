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

export type CashflowChartOptions = {
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

function aggregateByMonth(
	labels: string[],
	incomeData: number[],
	expenseData: number[],
) {
	const months = new Map<string, { income: number; expense: number }>()
	for (let i = 0; i < labels.length; i++) {
		const date = new Date(labels[i])
		const key = `${date.getFullYear()}-${date.getMonth()}`
		const entry = months.get(key) ?? { income: 0, expense: 0 }
		entry.income += incomeData[i] ?? 0
		entry.expense += expenseData[i] ?? 0
		months.set(key, entry)
	}
	const aggLabels: string[] = []
	const aggIncome: number[] = []
	const aggExpenses: number[] = []
	for (const [key, value] of months) {
		const [year, month] = key.split('-').map(Number)
		aggLabels.push(
			new Date(year, month, 1).toLocaleDateString('en', { month: 'short' }),
		)
		aggIncome.push(Math.round(value.income * 100) / 100)
		aggExpenses.push(Math.round(value.expense * 100) / 100)
	}
	return { labels: aggLabels, income: aggIncome, expenses: aggExpenses }
}

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

export function createCashflowOptions(
	labels: string[],
	incomeData: number[],
	expenseData: number[],
	period: 'week' | 'month' | 'year' = 'month',
): Partial<CashflowChartOptions> {
	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const border = getCssVar('--border') || 'oklch(0.92 0.004 286.32)'

	// Aggregate daily data into monthly totals for year view
	let chartLabels = labels
	let chartIncome = incomeData
	let chartExpenses = expenseData

	if (period === 'year') {
		const agg = aggregateByMonth(labels, incomeData, expenseData)
		chartLabels = agg.labels
		chartIncome = agg.income
		chartExpenses = agg.expenses
	}

	const dates = chartLabels.map((label) => {
		const parsed = new Date(label)
		return Number.isNaN(parsed.getTime()) ? null : parsed
	})
	const tooltipLabels = dates.map((date, i) => {
		if (!date) return chartLabels[i]
		if (period === 'week') {
			return date.toLocaleDateString('en', {
				weekday: 'short',
				day: 'numeric',
				month: 'short',
			})
		}
		return date.toLocaleDateString('en', { day: 'numeric', month: 'short' })
	})
	const categories =
		period === 'year'
			? chartLabels
			: dates.map((date) => {
					if (!date) return ''
					if (period === 'week') {
						return date.toLocaleDateString('en', { weekday: 'short' })
					}
					return date.toLocaleDateString('en', {
						day: 'numeric',
						month: 'short',
					})
				})

	return {
		series: [
			{ name: 'Income', data: chartIncome },
			{ name: 'Expenses', data: chartExpenses },
		],
		chart: {
			height: 300,
			width: '100%',
			type: 'area',
			toolbar: { show: false },
			fontFamily: 'Inter, sans-serif',
			foreColor: foreground,
			animations: {
				enabled: true,
				speed: 400,
				animateGradually: { enabled: false },
				dynamicAnimation: { enabled: true, speed: 250 },
			},
		},
		colors: ['hsl(160, 84%, 39%)', 'hsl(0, 72%, 51%)'],
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.3,
				opacityTo: 0,
				stops: [0, 100],
			},
		},
		dataLabels: { enabled: false },
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		markers: {
			size: 0,
			strokeWidth: 2,
			hover: {
				size: 4,
			},
		},
		xaxis: {
			type: 'category',
			categories,
			tickAmount: period === 'month' ? 10 : undefined,
			labels: {
				rotate: -45,
				rotateAlways: false,
				hideOverlappingLabels: true,
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
				style: { colors: foreground, fontSize: '12px' },
				formatter: (value: number) => {
					if (value >= 1000) return `€${(value / 1000).toFixed(1)}k`
					return `€${value}`
				},
			},
		},
		grid: {
			borderColor: border,
			strokeDashArray: 4,
		},
		legend: {
			position: 'top',
			horizontalAlign: 'right',
			fontSize: '14px',
			labels: { colors: foreground },
			markers: {
				shape: 'line',
				offsetX: -4,
				strokeWidth: 1,
			},
			itemMargin: { horizontal: 12 },
		},
		tooltip: {
			theme: 'dark',
			style: { fontSize: '12px' },
			x: {
				formatter: (_val: number, opts: { dataPointIndex: number }) =>
					tooltipLabels[opts.dataPointIndex] ?? '',
			},
			y: {
				formatter: (value: number) => `€${value.toLocaleString()}`,
			},
		},
	}
}
