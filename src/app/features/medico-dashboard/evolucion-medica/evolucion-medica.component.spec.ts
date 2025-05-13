import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolucionMedicaComponent } from './evolucion-medica.component';

describe('EvolucionMedicaComponent', () => {
  let component: EvolucionMedicaComponent;
  let fixture: ComponentFixture<EvolucionMedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolucionMedicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolucionMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
