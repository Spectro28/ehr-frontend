import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolucionesPacienteComponent } from './evoluciones-paciente.component';

describe('EvolucionesPacienteComponent', () => {
  let component: EvolucionesPacienteComponent;
  let fixture: ComponentFixture<EvolucionesPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvolucionesPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvolucionesPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
