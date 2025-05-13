import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaDetailComponent } from './cita-detail.component';

describe('CitaDetailComponent', () => {
  let component: CitaDetailComponent;
  let fixture: ComponentFixture<CitaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
