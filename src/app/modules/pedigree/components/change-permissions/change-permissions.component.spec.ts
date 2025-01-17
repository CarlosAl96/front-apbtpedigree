import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePermissionsComponent } from './change-permissions.component';

describe('ChangePermissionsComponent', () => {
  let component: ChangePermissionsComponent;
  let fixture: ComponentFixture<ChangePermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
