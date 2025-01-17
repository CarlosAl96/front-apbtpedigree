import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPedigreeViewComponent } from './public-pedigree-view.component';

describe('PublicPedigreeViewComponent', () => {
  let component: PublicPedigreeViewComponent;
  let fixture: ComponentFixture<PublicPedigreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicPedigreeViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicPedigreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
