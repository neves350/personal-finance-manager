import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { ExportsApi } from '@core/api/exports.api'
import { TransactionsService } from '@core/services/transactions.service'
import { mockTransactions } from '@core/testing/mocks'
import { toast } from 'ngx-sonner'
import { of, throwError } from 'rxjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionsExport } from './transactions-export'

const mockExportsApi = {
	downloadCsv: vi.fn(),
	downloadPdf: vi.fn(),
}

describe('TransactionsExport', () => {
	let component: TransactionsExport
	let fixture: ComponentFixture<TransactionsExport>

	beforeEach(async () => {
		vi.restoreAllMocks()
		vi.spyOn(toast, 'loading').mockReturnValue('toast-id')
		vi.spyOn(toast, 'success').mockImplementation(() => '')
		vi.spyOn(toast, 'error').mockImplementation(() => '')
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

		await TestBed.configureTestingModule({
			imports: [TransactionsExport],
			providers: [
				{ provide: ExportsApi, useValue: mockExportsApi },
				{ provide: TransactionsService, useValue: mockTransactions },
			],
		}).compileComponents()

		fixture = TestBed.createComponent(TransactionsExport)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	describe('downloadCsv()', () => {
		it('should show loading toast', () => {
			mockExportsApi.downloadCsv.mockReturnValue(of(new Blob()))

			component.downloadCsv()

			expect(toast.loading).toHaveBeenCalledWith('Downloading CSV...')
		})

		it('should call exportsApi.downloadCsv with date params', () => {
			mockExportsApi.downloadCsv.mockReturnValue(of(new Blob()))

			component.downloadCsv()

			expect(mockExportsApi.downloadCsv).toHaveBeenCalledWith(
				expect.objectContaining({
					startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
					endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
				}),
			)
		})

		it('should trigger file download on success', () => {
			const blob = new Blob(['csv-data'])
			mockExportsApi.downloadCsv.mockReturnValue(of(blob))
			const clickSpy = vi.fn()
			const realCreateElement = document.createElement.bind(document)
			vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
				if (tag === 'a') {
					return {
						set href(_: string) {},
						set download(_: string) {},
						click: clickSpy,
					} as unknown as HTMLAnchorElement
				}
				return realCreateElement(tag)
			})

			component.downloadCsv()

			expect(clickSpy).toHaveBeenCalled()
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
		})

		it('should show success toast on completion', () => {
			mockExportsApi.downloadCsv.mockReturnValue(of(new Blob()))

			component.downloadCsv()

			expect(toast.success).toHaveBeenCalledWith('CSV downloaded', {
				id: 'toast-id',
			})
		})

		it('should show error toast on failure', () => {
			mockExportsApi.downloadCsv.mockReturnValue(
				throwError(() => new Error('fail')),
			)

			component.downloadCsv()

			expect(toast.error).toHaveBeenCalledWith('Export failed', {
				id: 'toast-id',
			})
		})
	})

	describe('downloadPdf()', () => {
		it('should show loading toast', () => {
			mockExportsApi.downloadPdf.mockReturnValue(of(new Blob()))

			component.downloadPdf()

			expect(toast.loading).toHaveBeenCalledWith('Downloading PDF...')
		})

		it('should call exportsApi.downloadPdf with date params', () => {
			mockExportsApi.downloadPdf.mockReturnValue(of(new Blob()))

			component.downloadPdf()

			expect(mockExportsApi.downloadPdf).toHaveBeenCalledWith(
				expect.objectContaining({
					startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
					endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
				}),
			)
		})

		it('should show success toast on completion', () => {
			mockExportsApi.downloadPdf.mockReturnValue(of(new Blob()))

			component.downloadPdf()

			expect(toast.success).toHaveBeenCalledWith('PDF downloaded', {
				id: 'toast-id',
			})
		})

		it('should show error toast on failure', () => {
			mockExportsApi.downloadPdf.mockReturnValue(
				throwError(() => new Error('fail')),
			)

			component.downloadPdf()

			expect(toast.error).toHaveBeenCalledWith('Export failed', {
				id: 'toast-id',
			})
		})
	})

	describe('buildParams', () => {
		it('should include filter params when activeFilters has values', () => {
			mockTransactions.activeFilters.set({
				accountId: 'acc-1',
				categoryId: 'cat-1',
				type: 'EXPENSE',
			})
			mockExportsApi.downloadCsv.mockReturnValue(of(new Blob()))

			component.downloadCsv()

			expect(mockExportsApi.downloadCsv).toHaveBeenCalledWith(
				expect.objectContaining({
					accountId: 'acc-1',
					categoryId: 'cat-1',
					type: 'EXPENSE',
				}),
			)
		})

		it('should exclude empty filter params', () => {
			mockTransactions.activeFilters.set({})
			mockExportsApi.downloadCsv.mockReturnValue(of(new Blob()))

			component.downloadCsv()

			const params = mockExportsApi.downloadCsv.mock.calls[0][0]
			expect(params).not.toHaveProperty('accountId')
			expect(params).not.toHaveProperty('categoryId')
			expect(params).not.toHaveProperty('type')
		})
	})
})
