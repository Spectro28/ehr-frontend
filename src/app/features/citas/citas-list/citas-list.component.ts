import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitasService } from '../../../core/services/cita.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cita {
  id: number;
  pacienteId: number;
  consultorioId: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'atendido' | 'cancelado';
  paciente?: {
    primer_nombre: string;
    segundo_nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    cedula: string;
  };
  doctor?: {
    username: string;
    especialidad: string;
  };
  consultorio?: {
    numero: string;
  };
}

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas-list.component.html',
  styleUrls: ['./citas-list.component.css']
})
export class CitasListComponent implements OnInit {
  citas: Cita[] = [];
  citasSinFiltrar: Cita[] = [];
  loading = false;
  error = '';
  filtroFecha: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  constructor(
    private citaService: CitasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas() {
    this.loading = true;


    this.citaService.getAllCitas().subscribe({
      next: (citas: Cita[]) => {
        console.log('Citas recibidas:', citas);
        this.citas = citas;
        this.citasSinFiltrar = [...citas];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar citas:', error);
        this.error = error.message || 'Error al cargar las citas';
        this.loading = false;
      }
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/secretaria/citas', id]);
  }

  nuevaCita() {
    this.router.navigate(['/secretaria/citas/nueva']);
  }

  editarCita(id: number) {
    this.router.navigate(['/secretaria/citas', id, 'editar']);
  }

  cancelarCita(id: number) {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      this.citaService.updateEstadoCita(id, 'cancelado').subscribe({
        next: () => {
          // Solo recargar las citas
          this.cargarCitas();
          // Opcional: mostrar mensaje de éxito
          alert('Cita cancelada exitosamente');
        },
        error: (error: any) => {
          this.error = 'Error al cancelar la cita';
          console.error('Error:', error);
          // Opcional: mostrar mensaje de error al usuario
          alert('Error al cancelar la cita: ' + error.message);
        }
      });
    }
  }
  filtrarCitas() {
    let citasFiltradas = [...this.citasSinFiltrar];

    // Filtro por búsqueda (nombre o cédula)
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase().trim();
      citasFiltradas = citasFiltradas.filter(cita => {
        const nombreCompleto = this.getNombreCompletoPaciente(cita.paciente).toLowerCase();
        const cedula = cita.paciente?.cedula?.toLowerCase() || '';
        return nombreCompleto.includes(busqueda) || cedula.includes(busqueda);
      });
    }

    // Filtro por fecha
    if (this.filtroFecha) {
      citasFiltradas = citasFiltradas.filter(cita => {
        const fechaCita = new Date(cita.fecha).toISOString().split('T')[0];
        return fechaCita === this.filtroFecha;
      });
    }

    // Filtro por estado
    if (this.filtroEstado) {
      citasFiltradas = citasFiltradas.filter(cita => 
        cita.estado === this.filtroEstado
      );
    }

    this.citas = citasFiltradas;
  }

  limpiarFiltros() {
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.filtroBusqueda = ''; // Agregar esta línea
    this.citas = [...this.citasSinFiltrar];
  }

  // Método helper para mostrar el nombre completo del paciente
  getNombreCompletoPaciente(paciente: Cita['paciente']): string {
    if (!paciente) return 'N/A';
    return `${paciente.primer_nombre} ${paciente.segundo_nombre || ''} ${paciente.apellido_paterno} ${paciente.apellido_materno || ''}`.trim();
  }
}