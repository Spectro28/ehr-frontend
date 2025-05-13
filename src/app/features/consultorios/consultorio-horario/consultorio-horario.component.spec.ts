import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultorioHorarioComponent } from './consultorio-horario.component';

describe('ConsultorioHorarioComponent', () => {
  let component: ConsultorioHorarioComponent;
  let fixture: ComponentFixture<ConsultorioHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultorioHorarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultorioHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
