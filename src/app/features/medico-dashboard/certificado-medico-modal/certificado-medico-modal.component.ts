import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certificado-medico-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificado-medico-modal.component.html',
  styleUrls: ['./certificado-medico-modal.component.css']
})
export class CertificadoMedicoModalComponent {
  @Input() evolucion: any;
  @Input() paciente: any;
  diasReposo: number = 1;
  tipoReposo: string = 'absoluto';
  observaciones: string = '';
  modalRef?: any;

  cerrar() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  generarCertificado() {
    const datos = {
      diasReposo: this.diasReposo,
      tipoReposo: this.tipoReposo,
      observaciones: this.observaciones
    };
    if (this.modalRef) {
      this.modalRef.close(datos);
    }
  }
}