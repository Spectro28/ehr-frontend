import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitalSignsListComponent } from './vital-signs-list.component';

describe('VitalSignsListComponent', () => {
  let component: VitalSignsListComponent;
  let fixture: ComponentFixture<VitalSignsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalSignsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitalSignsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
