import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPedigreesComponent } from './my-pedigrees.component';

describe('MyPedigreesComponent', () => {
  let component: MyPedigreesComponent;
  let fixture: ComponentFixture<MyPedigreesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPedigreesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPedigreesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
