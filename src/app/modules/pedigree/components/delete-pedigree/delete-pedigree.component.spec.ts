import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePedigreeComponent } from './delete-pedigree.component';

describe('DeletePedigreeComponent', () => {
  let component: DeletePedigreeComponent;
  let fixture: ComponentFixture<DeletePedigreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletePedigreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletePedigreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
