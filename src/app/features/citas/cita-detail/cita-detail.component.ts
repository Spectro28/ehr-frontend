import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CitasService } from '../../../core/services/cita.service';

interface Paciente {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  cedula: string;
  telefono?: string;
}

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'atendido' | 'cancelado';
  notas?: string;
  paciente: Paciente;
  doctor: {
    id: number;
    username: string;
    especialidad: string;
  };
  consultorio: {
    id: number;
    numero: string;
  };
}

@Component({
  selector: 'app-citas-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cita-detail.component.html',
  styleUrls: ['./cita-detail.component.css']
})
export class CitasDetailComponent implements OnInit {
  cita: any = null;
  loading = false;
  error = '';

  constructor(
    private citasService: CitasService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const id = this.route.snapshot.params['id'];
    this.cargarCita(id);
  }

  cargarCita(id: number) {
    this.citasService.getCitaById(id).subscribe({
      next: (response: any) => {
        this.cita = response;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Error al cargar la cita';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  actualizarEstado(estado: 'pendiente' | 'atendido' | 'cancelado') {
    if (confirm(`¿Está seguro de marcar la cita como ${estado}?`)) {
      this.citasService.updateEstadoCita(this.cita.id, estado as 'pendiente' | 'atendido' | 'cancelado').subscribe({
        next: () => {
          this.cita.estado = estado;
        },
        error: (error: any) => {
          this.error = 'Error al actualizar el estado de la cita';
          console.error('Error:', error);
        }
      });
    }
  }

  editarCita() {
    this.router.navigate(['/citas', this.cita.id, 'editar']);
  }

  volver() {
    this.router.navigate(['secretaria/citas']);
  }

  cancelarCita() {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      this.citasService.updateEstadoCita(this.cita.id, 'cancelado').subscribe({
        next: () => {
          this.cita.estado = 'cancelado';
        },
        error: (error: any) => {
          this.error = 'Error al cancelar la cita';
          console.error('Error:', error);
        }
      });
    }
  }
}