import { Component, inject } from '@angular/core'
import { BudgetsService } from '@core/services/budgets.service'
import {
	ArrowLeftRightIcon,
	BadgeEuroIcon,
	CopyIcon,
	LucideAngularModule,
	PlusIcon,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { EnvelopeForm } from '@/shared/components/budgets/envelope-form/envelope-form'
import { EnvelopeList } from '@/shared/components/budgets/envelope-list/envelope-list'
import { TransferForm } from '@/shared/components/budgets/transfer-form/transfer-form'
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
	readonly ArrowLeftRightIcon = ArrowLeftRightIcon
	readonly CopyIcon = CopyIcon

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
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	openTransfer() {
		const budget = this.budget()
		if (!budget) return

		this.dialogService.create({
			zTitle: 'Transfer Between Envelopes',
			zContent: TransferForm,
			zWidth: '500px',
			zHideFooter: false,
			zOkText: 'Transfer',
			zData: { budgetId: budget.id },
			zOnOk: (instance: TransferForm) => {
				instance.submit()
				return false
			},
			zCustomClasses:
				'rounded-2xl border-4 [&_[data-slot=sheet-header]]:mt-4 [&>button:first-child]:top-5',
		})
	}

	copyPrevious() {
		const budget = this.budget()
		if (!budget) return

		this.budgetsService.copyPrevious(budget.id).subscribe({
			next: () => toast.success('Envelopes copied from previous month'),
			error: (err) =>
				toast.error(
					err.error?.message || 'Failed to copy from previous month',
				),
		})
	}
}
