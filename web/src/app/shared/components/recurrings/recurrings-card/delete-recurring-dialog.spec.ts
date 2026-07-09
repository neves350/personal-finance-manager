import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Z_MODAL_DATA } from '../../ui/dialog'
import { DeleteRecurringDialog } from './delete-recurring-dialog'

describe('DeleteRecurringDialog', () => {
	let component: DeleteRecurringDialog

	beforeEach(async () => {
		vi.restoreAllMocks()

		await TestBed.configureTestingModule({
			imports: [DeleteRecurringDialog],
			providers: [
				{
					provide: Z_MODAL_DATA,
					useValue: { description: 'Monthly Rent' },
				},
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(DeleteRecurringDialog)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})

	it('should inject modal data with description', () => {
		expect(component.data.description).toBe('Monthly Rent')
	})

	it('should start with deleteTransactions false', () => {
		expect(component.deleteTransactions()).toBe(false)
	})

	it('should update deleteTransactions when set', () => {
		component.deleteTransactions.set(true)
		expect(component.deleteTransactions()).toBe(true)
	})

	it('should toggle deleteTransactions back to false', () => {
		component.deleteTransactions.set(true)
		component.deleteTransactions.set(false)
		expect(component.deleteTransactions()).toBe(false)
	})
})
