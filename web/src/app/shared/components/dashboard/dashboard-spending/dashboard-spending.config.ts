import type {
	ApexChart,
	ApexDataLabels,
	ApexLegend,
	ApexNonAxisChartSeries,
	ApexPlotOptions,
	ApexStroke,
	ApexTooltip,
} from 'ng-apexcharts'

export type DonutChartOptions = {
	series: ApexNonAxisChartSeries
	chart: ApexChart
	labels: string[]
	colors: string[]
	legend: ApexLegend
	plotOptions: ApexPlotOptions
	dataLabels: ApexDataLabels
	tooltip: ApexTooltip
	stroke: ApexStroke
}

function getCssVar(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim()
}

function formatCurrency(value: number): string {
	return value.toLocaleString('pt-PT', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

function formatCompact(value: number): string {
	if (value >= 1000) {
		return `${(value / 1000).toFixed(1)}k`
	}
	return formatCurrency(value)
}

export function createDonutOptions(
	categories: string[],
	amounts: number[],
): Partial<DonutChartOptions> {
	const foreground = getCssVar('--foreground') || 'oklch(0.26 0.05 173)'
	const cardBg = getCssVar('--card') || 'oklch(1 0 0)'
	const mutedForeground =
		getCssVar('--muted-foreground') || 'oklch(0.55 0.02 264)'

	const baseColors = [
		getCssVar('--chart-1') || 'oklch(0.646 0.222 41.116)',
		getCssVar('--chart-2') || 'oklch(0.6 0.118 184.704)',
		getCssVar('--chart-3') || 'oklch(0.398 0.07 227.392)',
		getCssVar('--chart-4') || 'oklch(0.828 0.189 84.429)',
		getCssVar('--chart-5') || 'oklch(0.769 0.188 70.08)',
		'#f97316',
		'#ec4899',
		'#14b8a6',
		'#8b5cf6',
		'#f43f5e',
	]
	const chartColors = categories.map(
		(_, i) => baseColors[i % baseColors.length],
	)

	const total = amounts.reduce((sum, val) => sum + val, 0)

	const isMobile = window.innerWidth < 1024
	const chartHeight = isMobile ? 220 : 280
	const chartWidth = isMobile ? 180 : 220

	return {
		series: amounts,
		chart: {
			type: 'donut',
			height: chartHeight,
			width: chartWidth,
			fontFamily: 'inherit',
			foreColor: foreground,
			background: 'transparent',
		},
		labels: categories,
		colors: chartColors,
		plotOptions: {
			pie: {
				donut: {
					size: '70%',
					labels: {
						show: true,
						total: {
							show: true,
							label: 'Total',
							fontSize: '13px',
							color: mutedForeground,
							formatter: () => `€${formatCompact(total)}`,
						},
						value: {
							show: true,
							fontSize: '20px',
							fontWeight: 700,
							color: foreground,
							offsetY: 4,
							formatter: (val: string) => {
								const num = Number.parseFloat(val)
								return `€${formatCurrency(num)}`
							},
						},
						name: {
							show: true,
							offsetY: -8,
							fontSize: '12px',
							color: mutedForeground,
						},
					},
				},
			},
		},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: false,
		},
		stroke: {
			show: true,
			width: 5,
			colors: [cardBg],
		},
		tooltip: {
			theme: 'dark',
			style: {
				fontSize: '12px',
			},
			y: {
				formatter: (value: number) => `€${formatCurrency(value)}`,
			},
		},
	}
}
