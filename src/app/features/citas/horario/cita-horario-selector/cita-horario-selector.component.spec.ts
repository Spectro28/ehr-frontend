import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaHorarioSelectorComponent } from './cita-horario-selector.component';

describe('CitaHorarioSelectorComponent', () => {
  let component: CitaHorarioSelectorComponent;
  let fixture: ComponentFixture<CitaHorarioSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaHorarioSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitaHorarioSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
