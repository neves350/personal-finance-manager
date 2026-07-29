import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
	'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
	{
		variants: {
			zType: {
				default:
					'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
				destructive:
					'border-destructive/30 bg-destructive/15 text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
				available: 'border-primary/30 bg-primary/20 text-primary',
				unavailable:
					'border-secondary-foreground/30 bg-secondary-foreground/20 text-secondary-foreground',
				success: 'border-green-500/30 bg-green-500/15 text-primary',
				warning: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-500/95',
				completed: 'border-chart-2/30 bg-chart-2/15 text-chart-2/95',
				positive:
					'border-(--income-foreground-border) bg-(--income)/70 text-income-foreground',
				negative: 'border-destructive/30 bg-destructive/20 text-destructive',
				balance:
					'border-balance-foreground/30 bg-balance/70 text-balance-foreground',
			},
			zShape: {
				default: 'rounded-md',
				square: 'rounded-none',
				pill: 'rounded-full',
				soft: 'rounded-md p-2',
			},
		},
		defaultVariants: {
			zType: 'default',
			zShape: 'default',
		},
	},
)
export type ZardBadgeVariants = VariantProps<typeof badgeVariants>
