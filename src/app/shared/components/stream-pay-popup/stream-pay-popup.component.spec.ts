import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamPayPopupComponent } from './stream-pay-popup.component';

describe('StreamPayPopupComponent', () => {
  let component: StreamPayPopupComponent;
  let fixture: ComponentFixture<StreamPayPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamPayPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamPayPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
