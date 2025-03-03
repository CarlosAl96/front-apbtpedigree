import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStreamComponent } from './new-stream.component';

describe('NewStreamComponent', () => {
  let component: NewStreamComponent;
  let fixture: ComponentFixture<NewStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
