import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BudgetsService } from '@core/services/budgets.service'
import { Z_MODAL_DATA, ZardDialogRef } from '../../ui/dialog'
import { TransferForm } from './transfer-form'

describe('TransferForm', () => {
	let component: TransferForm
	let fixture: ComponentFixture<TransferForm>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TransferForm],
			providers: [
				{
					provide: Z_MODAL_DATA,
					useValue: {
						budgetId: 'budget-1',
						envelopes: [],
					},
				},
				{
					provide: ZardDialogRef,
					useValue: { close: () => {} },
				},
				{
					provide: BudgetsService,
					useValue: {
						envelopes: signal([]),
						transferBetweenEnvelopes: () => {},
					},
				},
			],
		}).compileComponents()

		fixture = TestBed.createComponent(TransferForm)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it('should create', () => {
		expect(component).toBeTruthy()
	})
})
