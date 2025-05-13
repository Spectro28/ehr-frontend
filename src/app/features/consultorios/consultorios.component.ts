import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultorioService, Consultorio, Doctor, Horario } from '../../core/services/consultorio.service';
import { ConsultorioHorarioComponent } from './consultorio-horario/consultorio-horario.component';

interface DiaHorario {
  fecha: Date;
  dia: string;
  horaInicio: string;
  horaFin: string;
  seleccionado: boolean;
}


@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ConsultorioHorarioComponent
  ],
  templateUrl: './consultorios.component.html',
  styleUrls: ['./consultorios.component.scss']
})
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];
  doctores: Doctor[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showForm = false;
  editMode = false;
  selectedConsultorioId: number | null = null;
  diasSeleccionados: DiaHorario[] = [];
  consultorioSeleccionado: Consultorio | null = null;

  newConsultorio: Omit<Consultorio, 'id'> = {
    numero: '',
    descripcion: '',
    doctorId: 0,
    horarios: []
  };

  readonly DIAS_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  constructor(private consultorioService: ConsultorioService) {}

  ngOnInit(): void {
    this.loadConsultorios();
    this.loadDoctores();
  }

  loadConsultorios(): void {
    this.isLoading = true;
    this.consultorioService.getConsultorios().subscribe({
      next: (consultorios) => {
        this.consultorios = consultorios;
        this.isLoading = false;
      },
      error: (error) => {
        this.showMessage('Error al cargar consultorios', true);
        this.isLoading = false;
      }
    });
  }

  loadDoctores(): void {
    this.consultorioService.getDoctores().subscribe({
      next: (doctores) => {
        this.doctores = doctores;
      },
      error: (error) => {
        this.showMessage('Error al cargar doctores', true);
      }
    });
  }

  createConsultorio(): void {
    if (this.validateForm()) {
      this.isLoading = true;
      this.consultorioService.createConsultorio(this.newConsultorio).subscribe({
        next: () => {
          this.showMessage('Consultorio creado exitosamente');
          this.loadConsultorios();
          this.resetForm();
        },
        error: (error) => {
          this.showMessage(error.error?.message || 'Error al crear consultorio', true);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  updateConsultorio(): void {
    if (!this.validateForm() || !this.selectedConsultorioId) {
      this.showMessage('Por favor, complete todos los campos requeridos', true);
      return;
    }
  
    this.isLoading = true;
  
    const consultorioActualizado = {
      numero: this.newConsultorio.numero,
      descripcion: this.newConsultorio.descripcion,
      doctorId: this.newConsultorio.doctorId,
      horarios: this.newConsultorio.horarios.map(h => ({
        dia: h.dia,
        fecha: h.fecha,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }))
    };
  
    console.log('Datos a enviar:', consultorioActualizado); // Debug
  
    this.consultorioService.updateConsultorio(
      this.selectedConsultorioId,
      consultorioActualizado
    ).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.showMessage('Consultorio actualizado exitosamente');
        this.loadConsultorios();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.showMessage('Error al actualizar el consultorio', true);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDiaSelect(dia: string): void {
    // Actualizar la selección de días
    this.diasSeleccionados = this.diasSeleccionados.map(d => ({
      ...d,
      seleccionado: d.dia === dia
    }));
    console.log('Día seleccionado:', dia);
  }

  deleteConsultorio(id: number): void {
    if (!id) {
      this.showMessage('ID de consultorio inválido', true);
      return;
    }
  
    if (confirm('¿Está seguro que desea eliminar este consultorio?')) {
      this.isLoading = true;
      console.log('Intentando eliminar consultorio:', id);
  
      this.consultorioService.deleteConsultorio(id).subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          if (response.success) {
            this.showMessage('Consultorio eliminado exitosamente');
            this.loadConsultorios();
          } else {
            this.showMessage(response.message || 'Error al eliminar consultorio', true);
          }
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          this.showMessage(
            error.message || 'Error al eliminar el consultorio. Por favor, intente nuevamente.',
            true
          );
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  editConsultorio(consultorio: Consultorio): void {
    console.log('Consultorio a editar:', consultorio); // Para debugging
    this.editMode = true;
    this.selectedConsultorioId = consultorio.id ?? null;
    this.consultorioSeleccionado = { ...consultorio };
    this.showForm = true;
  
    this.newConsultorio = {
      numero: consultorio.numero,
      descripcion: consultorio.descripcion,
      doctorId: consultorio.doctorId,
      horarios: consultorio.horarios.map(h => ({
        dia: h.dia,
        fecha: h.fecha, // Mantener la fecha original
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }))
    };
  
    console.log('Horarios después de mapeo:', this.newConsultorio.horarios); // Para debugging
  
  
    this.diasSeleccionados = this.newConsultorio.horarios.map(h => ({
      fecha: new Date(h.fecha), // Usar la fecha del horario
      dia: h.dia,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      seleccionado: true
    }));
  }

  

  // Mejorar el método validateForm
  validateForm(): boolean {
    if (!this.newConsultorio.numero.trim()) {
      this.showMessage('El número de consultorio es requerido', true);
      return false;
    }
  
    if (!this.newConsultorio.doctorId || this.newConsultorio.doctorId === 0) {
      this.showMessage('Debe seleccionar un doctor', true);
      return false;
    }
  
    if (!this.newConsultorio.horarios || this.newConsultorio.horarios.length === 0) {
      this.showMessage('Debe agregar al menos un horario', true);
      return false;
    }
  
    return true;
  }

  resetForm(): void {
    this.newConsultorio = {
      numero: '',
      descripcion: '',
      doctorId: 0,
      horarios: []
    };
    this.diasSeleccionados = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.editMode = false;
    this.selectedConsultorioId = null;
    this.showForm = false;
  }

  onHorariosChange(horarios: Horario[]) {
    this.newConsultorio.horarios = horarios.map(h => ({
      dia: h.dia,
      fecha: h.fecha,
      horaInicio: h.horaInicio,
      horaFin: h.horaFin
    }));
  }

  showMessage(message: string, isError = false): void {
    if (isError) {
      this.errorMessage = message;
      this.successMessage = '';
    } else {
      this.successMessage = message;
      this.errorMessage = '';
    }

    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctores.find(d => d.id === doctorId);
    return doctor ? `${doctor.username} - ${doctor.especialidad}` : 'No asignado';
  }

  formatHorarios(horarios: Horario[]): string {
    return horarios.map(h => 
      `${h.dia}: ${h.horaInicio} - ${h.horaFin}`
    ).join('\n');
  }
}