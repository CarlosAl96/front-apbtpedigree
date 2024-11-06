import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineInfoComponent } from './online-info.component';

describe('OnlineInfoComponent', () => {
  let component: OnlineInfoComponent;
  let fixture: ComponentFixture<OnlineInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
