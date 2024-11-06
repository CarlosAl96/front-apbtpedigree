import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedigreesComponent } from './pedigrees.component';

describe('PedigreesComponent', () => {
  let component: PedigreesComponent;
  let fixture: ComponentFixture<PedigreesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedigreesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedigreesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
