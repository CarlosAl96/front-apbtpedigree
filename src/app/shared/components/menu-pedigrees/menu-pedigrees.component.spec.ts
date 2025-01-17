import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPedigreesComponent } from './menu-pedigrees.component';

describe('MenuPedigreesComponent', () => {
  let component: MenuPedigreesComponent;
  let fixture: ComponentFixture<MenuPedigreesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPedigreesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuPedigreesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
