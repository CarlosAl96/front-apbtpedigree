import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPedigreeComponent } from './new-pedigree.component';

describe('NewPedigreeComponent', () => {
  let component: NewPedigreeComponent;
  let fixture: ComponentFixture<NewPedigreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPedigreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPedigreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
