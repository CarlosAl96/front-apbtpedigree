import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferOwnershipComponent } from './transfer-ownership.component';

describe('TransferOwnershipComponent', () => {
  let component: TransferOwnershipComponent;
  let fixture: ComponentFixture<TransferOwnershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferOwnershipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferOwnershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
