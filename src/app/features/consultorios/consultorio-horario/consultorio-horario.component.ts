import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HorarioConsulta {
  dia: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

@Component({
  selector: 'app-consultorio-horario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultorio-horario.component.html',
  styleUrls: ['./consultorio-horario.component.scss']
})
export class ConsultorioHorarioComponent implements OnInit {
  mensajeError: string = '';
  @Input() set horarios(value: any[]) {
    if (value && value.length > 0) {
      console.log('Horarios recibidos en el setter:', value); // Para debugging
      this.horariosLista = value.map(h => ({
        dia: h.dia,
        fecha: h.fecha, // Asegurarnos de mantener la fecha
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }));
      console.log('Horarios lista después de mapeo:', this.horariosLista); // Para debugging
    }
  }

  @Output() horariosChange = new EventEmitter<HorarioConsulta[]>();

  horariosLista: HorarioConsulta[] = [];
  nuevoHorario: HorarioConsulta = {
    dia: '',
    fecha: '',
    horaInicio: '',
    horaFin: ''
  };

  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  
  get fechaMinima(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  ngOnInit() {
    this.resetNuevoHorario();
  }

  agregarHorario(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    this.mensajeError = '';
    if (this.validarHorario(this.nuevoHorario)) {
      // Ajustamos para manejar correctamente la zona horaria
      const fechaLocal = new Date(this.nuevoHorario.fecha + 'T00:00:00');
      fechaLocal.setMinutes(fechaLocal.getMinutes() + fechaLocal.getTimezoneOffset());
      
      const horarioCompleto = {
        ...this.nuevoHorario,
        dia: this.obtenerNombreDia(fechaLocal)
      };
  
      // Verificar si ya existe un horario para esa fecha
      const existeHorario = this.horariosLista.some(
        h => h.fecha === horarioCompleto.fecha
      );
  
      if (existeHorario) {
        this.mensajeError = 'Ya existe un horario para esta fecha';
        return;
      }
  
      this.horariosLista.push(horarioCompleto);
      this.resetNuevoHorario();
      this.emitirCambios();
    }
  }

  eliminarHorario(index: number) {
    this.horariosLista.splice(index, 1);
    this.emitirCambios();
  }

  validarHorario(horario: HorarioConsulta): boolean {
    if (!horario.fecha || !horario.horaInicio || !horario.horaFin) {
      this.mensajeError = 'Todos los campos son obligatorios';
      return false;
    }

    if (horario.horaInicio >= horario.horaFin) {
      this.mensajeError = 'La hora de inicio debe ser menor a la hora de fin';
      return false;
    }

    return true;
  }
  onFechaChange(fecha: string) {
    this.nuevoHorario.fecha = fecha;
    if (fecha) {
      // Ajustamos para manejar correctamente la zona horaria
      const fechaLocal = new Date(fecha + 'T00:00:00');
      fechaLocal.setMinutes(fechaLocal.getMinutes() + fechaLocal.getTimezoneOffset());
      this.nuevoHorario.dia = this.obtenerNombreDia(fechaLocal);
    }
  }

  private obtenerFechaActual(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  private obtenerNombreDia(fecha: Date): string {
    // Ajustamos para manejar correctamente la zona horaria
    const fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[fechaLocal.getDay()];
  }

  private resetNuevoHorario() {
    const fechaActual = new Date();
    // Ajustamos para manejar correctamente la zona horaria
    const fechaLocal = new Date(fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000);
    const fechaFormateada = fechaLocal.toISOString().split('T')[0];
    
    this.nuevoHorario = {
      dia: this.obtenerNombreDia(fechaLocal),
      fecha: fechaFormateada,
      horaInicio: '',
      horaFin: ''
    };
  }

  private emitirCambios() {
    // Ordenar los horarios por fecha
    this.horariosLista.sort((a, b) => a.fecha.localeCompare(b.fecha));
    this.horariosChange.emit(this.horariosLista);
  }

  formatearFecha(fecha: string): string {
    try {
      if (!fecha) return 'Fecha no disponible';
      
      // Ajustamos para manejar correctamente la zona horaria
      const fechaLocal = new Date(fecha + 'T00:00:00');
      fechaLocal.setMinutes(fechaLocal.getMinutes() + fechaLocal.getTimezoneOffset());
  
      return fechaLocal.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en formato de fecha';
    }
  }
}