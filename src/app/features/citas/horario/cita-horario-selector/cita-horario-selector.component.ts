import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
import { CitasService } from '../../../../core/services/cita.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  estado: 'ocupado' | 'disponible';
  motivo?: string;
}
export interface HorarioConsultorio {
  dia: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

@Component({
  selector: 'app-cita-horario-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cita-horario-selector.component.html',
  styleUrls: ['./cita-horario-selector.component.css']
})
export class CitaHorarioSelectorComponent implements OnInit {
  @Input() consultorio: any;
  @Input() citasExistentes: any[] = [];
  @Output() horarioSeleccionado = new EventEmitter<{fecha: string, hora: string}>();

  horariosSemana: any[] = [];
  diaSeleccionado: any = null;
  horasDisponibles: HorarioDisponible[] = [];
  horaSeleccionada: string | null = null;

  constructor(private citaService: CitasService) {}

  ngOnInit() {
    this.inicializarHorarios();
  }

  inicializarHorarios() {
    if (!this.consultorio?.horarios) {
      console.log('No hay horarios configurados');
      return;
    }

      // Usar directamente los horarios configurados
      this.horariosSemana = this.consultorio.horarios
      .filter((h: any) => h.horaInicio && h.horaFin && h.fecha)
      .map((h: any) => ({
        dia: h.dia,
        fecha: h.fecha,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin
      }));

    // Ordenar los horarios por fecha
    this.horariosSemana.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    console.log('Horarios inicializados:', this.horariosSemana);
  }

  obtenerFechaProxima(dia: string): Date {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const hoy = new Date();
    const diaActual = hoy.getDay();
    const diaObjetivo = dias.indexOf(dia);
    let diasHasta = diaObjetivo - diaActual;
    
    if (diasHasta <= 0) {
      diasHasta += 7;
    }
    
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + diasHasta);
    return fecha;
  }

  seleccionarDia(horario: HorarioConsultorio) {
    console.log('Día seleccionado:', horario);
    this.diaSeleccionado = horario;
    this.horaSeleccionada = null;
    this.generarHorasDisponibles();
  }


  generarHorasDisponibles() {
    if (!this.diaSeleccionado) return;
  
    const horaInicio = new Date(`2000-01-01T${this.diaSeleccionado.horaInicio}`);
    const horaFin = new Date(`2000-01-01T${this.diaSeleccionado.horaFin}`);
    
    this.horasDisponibles = [];
    
    while (horaInicio < horaFin) {
      const horaStr = horaInicio.toTimeString().slice(0, 5);
      
      this.citaService.verificarDisponibilidad(
        this.diaSeleccionado.fecha, // Usamos la fecha directamente
        horaStr, 
        this.consultorio.id
      )
        .pipe(take(1))
        .subscribe({
          next: (disponible) => {
            this.horasDisponibles.push({
              hora: horaStr,
              disponible: disponible,
              estado: disponible ? 'disponible' : 'ocupado',
              motivo: disponible ? undefined : 'Horario no disponible'
            });
            // Ordenar las horas
            this.horasDisponibles.sort((a, b) => a.hora.localeCompare(b.hora));
          },
          error: (error) => {
            console.error(`Error al verificar hora ${horaStr}:`, error);
          }
        });
      
      horaInicio.setMinutes(horaInicio.getMinutes() + 30);
    }
  }


  seleccionarHora(hora: string) {
    if (!this.diaSeleccionado) return;
  
    const fecha = this.diaSeleccionado.fecha;
    
    this.citaService.verificarDisponibilidad(fecha, hora, this.consultorio.id)
      .pipe(take(1))
      .subscribe({
        next: (disponible: boolean) => {
          if (disponible) {
            this.horaSeleccionada = hora;
            this.horarioSeleccionado.emit({ fecha, hora });
          } else {
            const horarioIndex = this.horasDisponibles.findIndex(h => h.hora === hora);
            if (horarioIndex !== -1) {
              this.horasDisponibles[horarioIndex] = {
                ...this.horasDisponibles[horarioIndex],
                disponible: false,
                estado: 'ocupado',
                motivo: 'Horario ya reservado'
              };
            }
          }
        },
        error: (error) => {
          console.error('Error al verificar disponibilidad:', error);
        }
      });
  }


  isHoraDisponible(hora: string): boolean {
    const horario = this.horasDisponibles.find(h => h.hora === hora);
    return horario ? horario.disponible : false;
  }

  getEstadoHora(hora: string): string {
    if (this.horaSeleccionada === hora) return 'seleccionado';
    return this.isHoraDisponible(hora) ? 'disponible' : 'ocupado';
  }
}