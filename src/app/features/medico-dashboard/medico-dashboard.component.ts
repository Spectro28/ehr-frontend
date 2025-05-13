import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicoService } from '../../core/services/medico.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './medico-dashboard.component.html',
  styleUrls: ['./medico-dashboard.component.css']
})
export class MedicoDashboardComponent implements OnInit {
  pacientesConEvolucion: any[] = [];
  pacientesSinEvolucion: any[] = [];
  loading = false;
  error = '';
  filterForm: FormGroup;
  pacientesOtrosMedicos: any[] = [];

  constructor(
    private medicoService: MedicoService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      busqueda: [''],
      fecha: ['']
    });
  }

  ngOnInit() {
    this.cargarPacientesClasificados();
    this.cargarPacientesOtrosMedicos();
    this.setupFiltros();
  }

  setupFiltros() {
    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  cargarPacientesOtrosMedicos() {
    this.loading = true;
    this.medicoService.getPacientesOtrosMedicos().subscribe({
        next: (response) => {
            this.pacientesOtrosMedicos = response.data;
            this.loading = false;
        },
        error: (error) => {
            this.error = 'Error al cargar pacientes de otros médicos';
            this.loading = false;
            console.error('Error:', error);
        }
    });
}

// Método para ver evoluciones de otros médicos
verEvolucionesOtroMedico(pacienteId: number) {
  this.router.navigate(['/doctor/evoluciones-paciente', pacienteId]);
}
  cargarPacientesClasificados() {
    this.loading = true;
    this.medicoService.getPacientesClasificados().subscribe({
      next: (response) => {
        this.pacientesConEvolucion = response.data.conEvolucion;
        this.pacientesSinEvolucion = response.data.sinEvolucion;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los pacientes';
        this.loading = false;
        console.error('Error detallado:', error);
      }
    });
  }

    // Agregar nuevos métodos
    verEvoluciones(pacienteId: number) {
      // Verificar si hay token válido
      if (!this.authService.isAuthenticated()) {
        console.log('No autenticado, redirigiendo a login');
        this.router.navigate(['/login']);
        return;
      }
    
      this.router.navigate(['/doctor/evoluciones-paciente', pacienteId]);
    }
  
    editarEvolucion(evolucionId: number) {
      this.router.navigate(['/doctor/evolucion/edit', evolucionId]);
    }
  
    eliminarEvolucion(evolucionId: number) {
      if (confirm('¿Está seguro de eliminar esta evolución?')) {
        this.medicoService.eliminarEvolucion(evolucionId).subscribe({
          next: () => {
            this.cargarPacientesClasificados();
          },
          error: (error) => {
            this.error = 'Error al eliminar la evolución';
            console.error('Error:', error);
          }
        });
      }
    }

  aplicarFiltros() {
    const filtros = this.filterForm.value;
    this.loading = true;
    
    // Llamar al método sin parámetros
    this.medicoService.getPacientesConSignos().subscribe({
      next: (data) => {
        // Aplicar filtros localmente
        this.pacientesConEvolucion = this.filtrarPacientes(data, filtros);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al aplicar los filtros';
        this.loading = false;
      }
    });
  }

  // Método para filtrar pacientes localmente

  private filtrarPacientes(pacientes: any[], filtros: any): any[] {
    if (!pacientes) return [];
    
    return pacientes.filter(paciente => {
      let cumpleFiltros = true;

      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombreCompleto = `${paciente.primer_nombre} ${paciente.apellido_paterno}`.toLowerCase();
        const cedula = paciente.cedula?.toLowerCase() || '';
        cumpleFiltros = cumpleFiltros && (nombreCompleto.includes(busqueda) || cedula.includes(busqueda));
      }

      if (filtros.fecha) {
        // Solo verificamos la fecha si el paciente tiene signos vitales
        if (paciente.signosVitales && paciente.signosVitales[0]) {
          const fechaFiltro = new Date(filtros.fecha);
          const fechaSignos = new Date(paciente.signosVitales[0].fecha_medicion);
          cumpleFiltros = cumpleFiltros && 
            fechaSignos.toDateString() === fechaFiltro.toDateString();
        } else {
          cumpleFiltros = false;
        }
      }

      return cumpleFiltros;
    });
  }

  crearEvolucion(pacienteId: number) {
    // Verificar si hay token válido
    if (!this.authService.isAuthenticated()) {
      console.log('No autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Creando evolución para paciente:', pacienteId);
    // Cambiado de '/doctor/evolucion/nueva' a '/doctor/evolucion/new'
    this.router.navigate(['/doctor/evolucion/new'], {
      queryParams: { pacienteId: pacienteId }
    });
  }

  verEvolucion(evolucionId: number) {
    this.router.navigate([`/doctor/evolucion/${evolucionId}`]);
  }

  irAPacientes() {
    // Verificar autenticación antes de navegar
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/doctor/pacientes']);
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  }
