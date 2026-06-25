import { TestBed } from '@angular/core/testing'
import { BudgetsApi } from '@core/api/budgets.api'
import type {
	Budget,
	BudgetListItem,
	BudgetSummary,
	Envelope,
} from '@core/api/budgets.interface'
import { of, throwError } from 'rxjs'
import { BudgetsService } from './budgets.service'

const mockSummary: BudgetSummary = {
	totalAllocated: 500,
	totalSpent: 200,
	totalRemaining: 300,
	envelopeCount: 2,
	overspentCount: 0,
	warningCount: 1,
}

const mockEnvelope = (overrides: Partial<Envelope> = {}): Envelope => ({
	id: 'env-1',
	categoryId: 'cat-1',
	allocatedAmount: 300,
	spentAmount: 100,
	remainingAmount: 200,
	progress: 33,
	status: 'on_track',
	category: {
		id: 'cat-1',
		title: 'Groceries',
		icon: 'shopping-cart',
		type: 'EXPENSE',
	},
	...overrides,
})

const mockBudget: Budget = {
	id: 'budget-1',
	month: 6,
	year: 2026,
	note: 'June budget',
	envelopes: [
		mockEnvelope(),
		mockEnvelope({
			id: 'env-2',
			categoryId: 'cat-2',
			allocatedAmount: 200,
			spentAmount: 170,
			remainingAmount: 30,
			progress: 85,
			status: 'warning',
			category: {
				id: 'cat-2',
				title: 'Transport',
				icon: 'car',
				type: 'EXPENSE',
			},
		}),
	],
	summary: mockSummary,
	createdAt: '2026-06-01T00:00:00.000Z',
	updatedAt: '2026-06-01T00:00:00.000Z',
}

const mockBudgetsApi = {
	create: vi.fn(),
	findCurrent: vi.fn(),
	findByMonthYear: vi.fn(),
	findAll: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	addEnvelope: vi.fn(),
	updateEnvelope: vi.fn(),
	removeEnvelope: vi.fn(),
	transferEnvelopes: vi.fn(),
	copyPrevious: vi.fn(),
}

describe('BudgetsService', () => {
	let service: BudgetsService

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BudgetsService,
				{ provide: BudgetsApi, useValue: mockBudgetsApi },
			],
		})

		service = TestBed.inject(BudgetsService)

		vi.clearAllMocks()
	})

	describe('initial state', () => {
		it('should have null budget', () => {
			expect(service.budget()).toBeNull()
		})

		it('should have empty budget list', () => {
			expect(service.budgetList()).toEqual([])
		})

		it('should not be loading', () => {
			expect(service.loading()).toBe(false)
		})

		it('should have no error', () => {
			expect(service.error()).toBeNull()
		})

		it('should default selectedMonth to current month', () => {
			expect(service.selectedMonth()).toBe(new Date().getMonth() + 1)
		})

		it('should default selectedYear to current year', () => {
			expect(service.selectedYear()).toBe(new Date().getFullYear())
		})
	})

	describe('computed signals', () => {
		it('hasBudget should be false when budget is null', () => {
			expect(service.hasBudget()).toBe(false)
		})

		it('hasBudget should be true when budget exists', () => {
			service.budget.set(mockBudget)
			expect(service.hasBudget()).toBe(true)
		})

		it('envelopes should return empty array when no budget', () => {
			expect(service.envelopes()).toEqual([])
		})

		it('envelopes should return budget envelopes', () => {
			service.budget.set(mockBudget)
			expect(service.envelopes()).toHaveLength(2)
		})

		it('summary should return null when no budget', () => {
			expect(service.summary()).toBeNull()
		})

		it('summary should return budget summary', () => {
			service.budget.set(mockBudget)
			expect(service.summary()).toEqual(mockSummary)
		})

		it('warningEnvelopes should filter warning status', () => {
			service.budget.set(mockBudget)
			expect(service.warningEnvelopes()).toHaveLength(1)
			expect(service.warningEnvelopes()[0].id).toBe('env-2')
		})

		it('overspentEnvelopes should filter overspent status', () => {
			service.budget.set(mockBudget)
			expect(service.overspentEnvelopes()).toHaveLength(0)
		})

		it('envelopesAbove80Pct should count envelopes with progress >= 80', () => {
			service.budget.set(mockBudget)
			expect(service.envelopesAbove80Pct()).toBe(1)
		})

		it('topCriticalEnvelopes should sort by remaining amount ascending', () => {
			service.budget.set(mockBudget)
			const critical = service.topCriticalEnvelopes()
			expect(critical[0].remainingAmount).toBeLessThanOrEqual(
				critical[1].remainingAmount,
			)
		})

		it('topCriticalEnvelopes should return max 3 items', () => {
			const manyEnvelopes: Envelope[] = Array.from({ length: 5 }, (_, i) =>
				mockEnvelope({ id: `env-${i}`, remainingAmount: i * 10 }),
			)
			service.budget.set({ ...mockBudget, envelopes: manyEnvelopes })
			expect(service.topCriticalEnvelopes()).toHaveLength(3)
		})
	})

	describe('loadBudget', () => {
		it('should set budget on success', () => {
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))

			service.loadBudget().subscribe()

			expect(service.budget()).toEqual(mockBudget)
			expect(service.loading()).toBe(false)
		})

		it('should call findByMonthYear with selected month/year', () => {
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))
			service.selectedYear.set(2026)
			service.selectedMonth.set(6)

			service.loadBudget().subscribe()

			expect(mockBudgetsApi.findByMonthYear).toHaveBeenCalledWith(2026, 6)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.findByMonthYear.mockReturnValue(
				throwError(() => ({ error: { message: 'Not found' } })),
			)

			service.loadBudget().subscribe({ error: () => {} })

			expect(service.budget()).toBeNull()
			expect(service.error()).toBe('Not found')
			expect(service.loading()).toBe(false)
		})
	})

	describe('loadCurrent', () => {
		it('should set budget and update selectedMonth/Year', () => {
			mockBudgetsApi.findCurrent.mockReturnValue(of(mockBudget))

			service.loadCurrent().subscribe()

			expect(service.budget()).toEqual(mockBudget)
			expect(service.selectedMonth()).toBe(6)
			expect(service.selectedYear()).toBe(2026)
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.findCurrent.mockReturnValue(
				throwError(() => ({ error: { message: 'No budget' } })),
			)

			service.loadCurrent().subscribe({ error: () => {} })

			expect(service.budget()).toBeNull()
			expect(service.error()).toBe('No budget')
		})
	})

	describe('loadAll', () => {
		it('should set budgetList', () => {
			const list: BudgetListItem[] = [
				{ id: '1', month: 6, year: 2026, createdAt: '2026-06-01' },
				{ id: '2', month: 5, year: 2026, createdAt: '2026-05-01' },
			]
			mockBudgetsApi.findAll.mockReturnValue(of(list))

			service.loadAll().subscribe()

			expect(service.budgetList()).toEqual(list)
		})
	})

	describe('create', () => {
		it('should set budget with empty envelopes and summary', () => {
			const newBudget = {
				id: 'new-1',
				month: 7,
				year: 2026,
				createdAt: '2026-07-01',
				updatedAt: '2026-07-01',
			}
			mockBudgetsApi.create.mockReturnValue(
				of({ budget: newBudget, message: 'Budget created successfully' }),
			)

			service.create({ month: 7, year: 2026 }).subscribe()

			const budget = service.budget()
			expect(budget).not.toBeNull()
			expect(budget?.envelopes).toEqual([])
			expect(budget?.summary.totalAllocated).toBe(0)
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.create.mockReturnValue(
				throwError(() => ({ error: { message: 'Already exists' } })),
			)

			service.create({ month: 6, year: 2026 }).subscribe({ error: () => {} })

			expect(service.error()).toBe('Already exists')
			expect(service.loading()).toBe(false)
		})
	})

	describe('update', () => {
		it('should merge update into current budget', () => {
			service.budget.set(mockBudget)
			const updated = { ...mockBudget, note: 'Updated note' }
			mockBudgetsApi.update.mockReturnValue(of(updated))

			service.update('budget-1', { note: 'Updated note' }).subscribe()

			expect(service.budget()?.note).toBe('Updated note')
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			service.budget.set(mockBudget)
			mockBudgetsApi.update.mockReturnValue(
				throwError(() => ({ error: { message: 'Update failed' } })),
			)

			service
				.update('budget-1', { note: 'fail' })
				.subscribe({ error: () => {} })

			expect(service.error()).toBe('Update failed')
		})
	})

	describe('delete', () => {
		it('should set budget to null', () => {
			service.budget.set(mockBudget)
			mockBudgetsApi.delete.mockReturnValue(
				of({ message: 'Budget deleted successfully' }),
			)

			service.delete('budget-1').subscribe()

			expect(service.budget()).toBeNull()
		})

		it('should return the message', () => {
			mockBudgetsApi.delete.mockReturnValue(
				of({ message: 'Budget deleted successfully' }),
			)

			let result = ''
			service.delete('budget-1').subscribe((msg) => (result = msg))

			expect(result).toBe('Budget deleted successfully')
		})
	})

	describe('addEnvelope', () => {
		it('should call API and reload budget', () => {
			const newEnvelope = mockEnvelope({ id: 'env-new' })
			mockBudgetsApi.addEnvelope.mockReturnValue(
				of({ envelope: newEnvelope, message: 'Envelope added successfully' }),
			)
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))

			service
				.addEnvelope('budget-1', { categoryId: 'cat-1', allocatedAmount: 300 })
				.subscribe()

			expect(mockBudgetsApi.addEnvelope).toHaveBeenCalledWith('budget-1', {
				categoryId: 'cat-1',
				allocatedAmount: 300,
			})
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.addEnvelope.mockReturnValue(
				throwError(() => ({ error: { message: 'Duplicate category' } })),
			)

			service
				.addEnvelope('budget-1', { categoryId: 'cat-1', allocatedAmount: 300 })
				.subscribe({ error: () => {} })

			expect(service.error()).toBe('Duplicate category')
		})
	})

	describe('updateEnvelope', () => {
		it('should call API and reload budget', () => {
			const updated = mockEnvelope({ allocatedAmount: 500 })
			mockBudgetsApi.updateEnvelope.mockReturnValue(
				of({ envelope: updated, message: 'Envelope updated successfully' }),
			)
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))

			service
				.updateEnvelope('budget-1', 'env-1', { allocatedAmount: 500 })
				.subscribe()

			expect(mockBudgetsApi.updateEnvelope).toHaveBeenCalledWith(
				'budget-1',
				'env-1',
				{
					allocatedAmount: 500,
				},
			)
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.updateEnvelope.mockReturnValue(
				throwError(() => ({ error: { message: 'Envelope not found' } })),
			)

			service
				.updateEnvelope('budget-1', 'env-1', { allocatedAmount: 500 })
				.subscribe({ error: () => {} })

			expect(service.error()).toBe('Envelope not found')
		})
	})

	describe('removeEnvelope', () => {
		it('should call API and reload budget', () => {
			mockBudgetsApi.removeEnvelope.mockReturnValue(
				of({ message: 'Envelope removed successfully' }),
			)
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))

			let result = ''
			service
				.removeEnvelope('budget-1', 'env-1')
				.subscribe((msg) => (result = msg))

			expect(result).toBe('Envelope removed successfully')
			expect(mockBudgetsApi.removeEnvelope).toHaveBeenCalledWith(
				'budget-1',
				'env-1',
			)
		})
	})

	describe('transferEnvelopes', () => {
		it('should call API and reload budget', () => {
			const transferResponse = {
				from: mockEnvelope({ allocatedAmount: 250 }),
				to: mockEnvelope({ id: 'env-2', allocatedAmount: 250 }),
				message: 'Transfer completed successfully',
			}
			mockBudgetsApi.transferEnvelopes.mockReturnValue(of(transferResponse))
			mockBudgetsApi.findByMonthYear.mockReturnValue(of(mockBudget))

			service
				.transferEnvelopes('budget-1', {
					fromEnvelopeId: 'env-1',
					toEnvelopeId: 'env-2',
					amount: 50,
				})
				.subscribe()

			expect(mockBudgetsApi.transferEnvelopes).toHaveBeenCalledWith(
				'budget-1',
				{
					fromEnvelopeId: 'env-1',
					toEnvelopeId: 'env-2',
					amount: 50,
				},
			)
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.transferEnvelopes.mockReturnValue(
				throwError(() => ({ error: { message: 'Insufficient allocation' } })),
			)

			service
				.transferEnvelopes('budget-1', {
					fromEnvelopeId: 'env-1',
					toEnvelopeId: 'env-2',
					amount: 99999,
				})
				.subscribe({ error: () => {} })

			expect(service.error()).toBe('Insufficient allocation')
		})
	})

	describe('copyPrevious', () => {
		it('should set budget on success', () => {
			mockBudgetsApi.copyPrevious.mockReturnValue(of(mockBudget))

			service.copyPrevious('budget-1').subscribe()

			expect(service.budget()).toEqual(mockBudget)
			expect(service.loading()).toBe(false)
		})

		it('should set error on failure', () => {
			mockBudgetsApi.copyPrevious.mockReturnValue(
				throwError(() => ({ error: { message: 'No previous budget' } })),
			)

			service.copyPrevious('budget-1').subscribe({ error: () => {} })

			expect(service.error()).toBe('No previous budget')
		})
	})

	describe('navigateMonth', () => {
		beforeEach(() => {
			service.selectedMonth.set(6)
			service.selectedYear.set(2026)
		})

		it('should increment month by 1', () => {
			service.navigateMonth(1)
			expect(service.selectedMonth()).toBe(7)
			expect(service.selectedYear()).toBe(2026)
		})

		it('should decrement month by 1', () => {
			service.navigateMonth(-1)
			expect(service.selectedMonth()).toBe(5)
			expect(service.selectedYear()).toBe(2026)
		})

		it('should wrap December + 1 to January next year', () => {
			service.selectedMonth.set(12)

			service.navigateMonth(1)

			expect(service.selectedMonth()).toBe(1)
			expect(service.selectedYear()).toBe(2027)
		})

		it('should wrap January - 1 to December previous year', () => {
			service.selectedMonth.set(1)

			service.navigateMonth(-1)

			expect(service.selectedMonth()).toBe(12)
			expect(service.selectedYear()).toBe(2025)
		})
	})
})
