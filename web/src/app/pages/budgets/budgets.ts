import { Component, inject } from '@angular/core'
import { BudgetsService } from '@core/services/budgets.service'
import { BadgeEuroIcon, LucideAngularModule, PlusIcon } from 'lucide-angular'
import { EnvelopeForm } from '@/shared/components/budgets/envelope-form/envelope-form'
import { EnvelopeList } from '@/shared/components/budgets/envelope-list/envelope-list'
import { ZardButtonComponent } from '@/shared/components/ui/button'
import { ZardCardComponent } from '@/shared/components/ui/card'
import { ZardDialogService } from '@/shared/components/ui/dialog'
import { ZardLoaderComponent } from '@/shared/components/ui/loader'

@Component({
	selector: 'app-budgets',
	imports: [
		ZardButtonComponent,
		LucideAngularModule,
		ZardLoaderComponent,
		ZardCardComponent,
		EnvelopeList,
	],
	templateUrl: './budgets.html',
})
export class Budgets {
	readonly PlusIcon = PlusIcon
	readonly BadgeEuroIcon = BadgeEuroIcon

	private readonly budgetsService = inject(BudgetsService)
	private readonly dialogService = inject(ZardDialogService)

	readonly hasBudgets = this.budgetsService.hasBudget
	readonly isLoading = this.budgetsService.loading
	readonly budget = this.budgetsService.budget
	readonly envelopes = this.budgetsService.envelopes

	ngOnInit(): void {
		this.budgetsService.loadBudget().subscribe({
			error: () => {},
		})
	}

	openEnvelope() {
		const budget = this.budget()
		if (!budget) return

		this.dialogService.create({
			zTitle: 'Add Envelope',
			zContent: EnvelopeForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Add Envelope',
			zData: { budgetId: budget.id },
			zOnOk: (instance: EnvelopeForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-l-2xl border [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}
}
