import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalSignsFormComponent } from './vital-signs-form.component';

describe('VitalSignsFormComponent', () => {
  let component: VitalSignsFormComponent;
  let fixture: ComponentFixture<VitalSignsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalSignsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalSignsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
