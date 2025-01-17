import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedigreeViewComponent } from './pedigree-view.component';

describe('PedigreeViewComponent', () => {
  let component: PedigreeViewComponent;
  let fixture: ComponentFixture<PedigreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedigreeViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedigreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
