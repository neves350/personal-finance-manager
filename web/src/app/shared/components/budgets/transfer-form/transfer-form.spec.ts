import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferForm } from './transfer-form';

describe('TransferForm', () => {
  let component: TransferForm;
  let fixture: ComponentFixture<TransferForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
