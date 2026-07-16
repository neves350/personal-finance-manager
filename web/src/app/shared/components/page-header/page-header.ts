import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
	selector: 'app-page-header',
	template: `
		<div class="flex flex-col gap-4 md:flex-row md:justify-between md:items-start mb-4">
			<h1 class="flex flex-col page-title">
				{{ title() }}
				<span class="page-subtitle">{{ subtitle() }}</span>
			</h1>
			<div class="flex items-center gap-3 flex-wrap self-end md:self-auto">
				<ng-content />
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
	readonly title = input.required<string>()
	readonly subtitle = input.required<string>()
}
