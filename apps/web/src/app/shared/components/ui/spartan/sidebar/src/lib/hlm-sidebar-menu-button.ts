import { type BooleanInput } from '@angular/cdk/coercion'
import {
	booleanAttribute,
	computed,
	Directive,
	inject,
	input,
} from '@angular/core'
import {
	BrnTooltipTrigger,
	provideBrnTooltipDefaultOptions,
} from '@spartan-ng/brain/tooltip'
import { DEFAULT_TOOLTIP_CONTENT_CLASSES } from '@spartan-ng/helm/tooltip'
import { classes } from '@spartan-ng/helm/utils'
import { cva } from 'class-variance-authority'
import { HlmSidebarService } from './hlm-sidebar.service'

const sidebarMenuButtonVariants = cva(
	'peer/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground flex w-full items-center justify-start gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-[width,height,padding] outline-none group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!justify-center hover:cursor-pointer focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:cursor-default aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>ng-icon]:size-4 [&>ng-icon]:shrink-0 [&>i-lucide]:size-4 [&>i-lucide]:shrink-0 group-data-[collapsible=icon]:[&>i-lucide]:size-5 group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate',
	{
		variants: {
			variant: {
				default:
					'hover:bg-sidebar-accent hover:text-sidebar-foreground hover:border-1',
				outline:
					'bg-background shadow-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sidebar-accent',
			},
			size: {
				default: 'h-8 text-sm',
				sm: 'h-7 text-xs',
				md: 'h-10 text-sm',
				lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

@Directive({
	selector: 'button[hlmSidebarMenuButton], a[hlmSidebarMenuButton]',
	providers: [
		provideBrnTooltipDefaultOptions({
			showDelay: 150,
			hideDelay: 0,
			exitAnimationDuration: 150,
			tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
			position: 'right',
		}),
	],
	hostDirectives: [
		{
			directive: BrnTooltipTrigger,
			inputs: [
				'brnTooltipTrigger: tooltip',
				'brnTooltipDisabled: tooltipDisabled',
				'aria-describedby',
			],
		},
	],
	host: {
		'data-slot': 'sidebar-menu-button',
		'data-sidebar': 'menu-button',
		'[attr.data-size]': 'size()',
		'[attr.data-active]': 'isActive()',
	},
})
export class HlmSidebarMenuButton {
	private readonly _sidebarService = inject(HlmSidebarService)

	public readonly variant = input<'default' | 'outline'>('default')
	public readonly size = input<'default' | 'sm' | 'md' | 'lg'>('default')
	public readonly isActive = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	})

	readonly isCollapsed = computed(
		() => this._sidebarService.state() === 'collapsed',
	)

	constructor() {
		classes(() =>
			sidebarMenuButtonVariants({ variant: this.variant(), size: this.size() }),
		)
	}
}
