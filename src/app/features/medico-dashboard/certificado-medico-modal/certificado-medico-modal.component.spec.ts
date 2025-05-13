import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificadoMedicoModalComponent } from './certificado-medico-modal.component';

describe('CertificadoMedicoModalComponent', () => {
  let component: CertificadoMedicoModalComponent;
  let fixture: ComponentFixture<CertificadoMedicoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificadoMedicoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificadoMedicoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
