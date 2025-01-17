import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicLinkComponent } from './public-link.component';

describe('PublicLinkComponent', () => {
  let component: PublicLinkComponent;
  let fixture: ComponentFixture<PublicLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
