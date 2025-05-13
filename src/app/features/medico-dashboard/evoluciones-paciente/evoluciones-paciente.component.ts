import { Component, HostListener, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MedicoService } from '../../../core/services/medico.service';
import { AuthService } from '../../../core/services/auth.service';
import { PdfService } from '../../../core/services/pdf.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CertificadoMedicoModalComponent } from '../certificado-medico-modal/certificado-medico-modal.component';



@Component({
  selector: 'app-evoluciones-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './evoluciones-paciente.component.html',
  styleUrls: ['./evoluciones-paciente.component.css']
})
export class EvolucionesPacienteComponent implements OnInit {
  showDropdown = false;
  paciente: any = null;
  evoluciones: any[] = [];
  loading = true;
  error = '';
  esMedicoTratante: boolean = false;

  constructor(
    private medicoService: MedicoService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private pdfService: PdfService,
    private viewContainerRef: ViewContainerRef

  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.cargarEvolucionesPaciente(params['id']);
      } else {
        this.error = 'No se proporcionó ID del paciente';
        this.loading = false;
      }
    });
  }

  cargarEvolucionesPaciente(pacienteId: number) {
    this.loading = true;
    this.error = '';
    this.evoluciones = [];
  
    // Obtener el ID del médico actual
    const medicoActualId = this.medicoService.obtenerMedicoActualId();
  
    this.medicoService.getEvolucionesPaciente(pacienteId).subscribe({
      next: (response) => {
        if (response.success) {
          this.paciente = response.data.paciente;
          this.evoluciones = response.data.evoluciones || [];
          
          // Verificar si el médico actual es el médico tratante
          this.esMedicoTratante = this.paciente.medicoId === medicoActualId;
          
          // Procesar cada evolución para determinar permisos y formatear datos
          this.evoluciones = this.evoluciones.map(evolucion => {
            const diagnosticosFormateados = evolucion.diagnosticos?.map((diagnostico: any) => ({
              ...diagnostico,
              cie: {
                CODIGO: diagnostico.cie?.CODIGO || diagnostico.cie?.codigo,
                NOMBRE: diagnostico.cie?.NOMBRE || diagnostico.cie?.nombre
              }
            }));
  
            return {
              ...evolucion,
              diagnosticos: diagnosticosFormateados,
              puedeEditar: evolucion.medicoId === medicoActualId
            };
          });
  
          console.log('Evoluciones procesadas:', this.evoluciones);
        } else {
          this.error = 'Error al cargar los datos del paciente';
        }
      },
      error: (error) => {
        console.error('Error detallado:', error);
        this.error = 'Error al cargar las evoluciones del paciente';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  @HostListener('document:click')
  clickout() {
    this.showDropdown = false;
  }

  abrirModalCertificado(evolucion: any) {
    const modalElement = document.createElement('div');
    document.body.appendChild(modalElement);
    
    const componentRef = this.viewContainerRef.createComponent(CertificadoMedicoModalComponent);
    componentRef.instance.evolucion = evolucion;
    componentRef.instance.paciente = this.paciente;
    componentRef.instance.modalRef = {
      close: (result?: any) => {
        if (result) {
          this.pdfService.generarCertificadoMedico(evolucion, this.paciente, result);
        }
        componentRef.destroy();
        modalElement.remove();
      }
    };
  }

  generarRecetaPDF(evolucion: any) {
    if (evolucion && this.paciente) {
      this.pdfService.generarRecetaMedica(evolucion, this.paciente);
    }
  }

  crearNuevaEvolucion() {
    this.router.navigate(['/doctor/evolucion/new'], {
      queryParams: { pacienteId: this.paciente.id }
    });
  }

  editarEvolucion(evolucionId: number) {
    const evolucion = this.evoluciones.find(e => e.id === evolucionId);
    
    if (!evolucion?.puedeEditar) {
        this.error = 'No tienes permisos para editar esta evolución';
        return;
    }
    
    this.router.navigate(['/doctor/evolucion', evolucionId], {
        state: { mode: 'edit' }
    });
}

eliminarEvolucion(evolucionId: number) {
  const evolucion = this.evoluciones.find(e => e.id === evolucionId);
  
  if (!evolucion?.puedeEditar) {
      this.error = 'No tienes permisos para eliminar esta evolución';
      return;
  }

  if (confirm('¿Está seguro de eliminar esta evolución?')) {
      this.medicoService.eliminarEvolucion(evolucionId).subscribe({
          next: () => {
              this.cargarEvolucionesPaciente(this.paciente.id);
          },
          error: (error) => {
              this.error = 'Error al eliminar la evolución';
              console.error('Error:', error);
          }
      });
  }
}

verMasDetalles(evolucionId: number) {
  this.router.navigate(['/doctor/evolucion', evolucionId], {
    state: { mode: 'view' }
  });
}

  verEvolucion(evolucionId: number) {
    this.router.navigate(['/doctor/evolucion', evolucionId]);
  }

  volver() {
    this.router.navigate(['/doctor']);
  }
  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}