import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoStreamOrEndedComponent } from './no-stream-or-ended.component';

describe('NoStreamOrEndedComponent', () => {
  let component: NoStreamOrEndedComponent;
  let fixture: ComponentFixture<NoStreamOrEndedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoStreamOrEndedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoStreamOrEndedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
