import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ExportsApi } from '@core/api/exports.api'
import type { ExportsQueryParams } from '@core/api/exports.interface'
import { TransactionsService } from '@core/services/transactions.service'
import {
	DownloadIcon,
	FileSpreadsheetIcon,
	FileTextIcon,
	LucideAngularModule,
} from 'lucide-angular'
import { toast } from 'ngx-sonner'
import { ZardButtonComponent } from '../../ui/button'
import { ZardDropdownImports } from '../../ui/dropdown'

@Component({
	selector: 'app-transactions-export',
	imports: [ZardDropdownImports, ZardButtonComponent, LucideAngularModule],
	templateUrl: './transactions-export.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsExport {
	private readonly exportsApi = inject(ExportsApi)
	private readonly transactionsService = inject(TransactionsService)

	readonly DownloadIcon = DownloadIcon
	readonly FileSpreadsheetIcon = FileSpreadsheetIcon
	readonly FileTextIcon = FileTextIcon

	downloadCsv() {
		const toastId = toast.loading('Downloading CSV...')

		this.exportsApi.downloadCsv(this.buildParams()).subscribe({
			next: (blob) => {
				this.triggerDownload(blob, 'transactions.csv')
				toast.success('CSV downloaded', { id: toastId })
			},
			error: () => {
				toast.error('Export failed', { id: toastId })
			},
		})
	}

	downloadPdf() {
		const toastId = toast.loading('Downloading PDF...')

		this.exportsApi.downloadPdf(this.buildParams()).subscribe({
			next: (blob) => {
				this.triggerDownload(blob, 'transactions.pdf')
				toast.success('PDF downloaded', { id: toastId })
			},
			error: () => {
				toast.error('Export failed', { id: toastId })
			},
		})
	}

	private buildParams(): ExportsQueryParams {
		const filters = this.transactionsService.activeFilters()
		const { selectedYear, selectedMonth } = this.transactionsService

		const startDate = new Date(selectedYear(), selectedMonth(), 1)
			.toISOString()
			.slice(0, 10)
		const endDate = new Date(selectedYear(), selectedMonth() + 1, 0)
			.toISOString()
			.slice(0, 10)

		return {
			startDate,
			endDate,
			...(filters.accountId && { accountId: filters.accountId }),
			...(filters.categoryId && { categoryId: filters.categoryId }),
			...(filters.type && { type: filters.type }),
		}
	}

	private triggerDownload(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		a.click()
		URL.revokeObjectURL(url)
	}
}
