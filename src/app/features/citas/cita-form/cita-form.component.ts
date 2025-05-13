import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CitasService } from '../../../core/services/cita.service';
import { Consultorio } from '../../../interfaces/consultorio.interface';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { CitaHorarioSelectorComponent } from '../horario/cita-horario-selector/cita-horario-selector.component';

interface Paciente {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  cedula: string;
}

interface HorarioSeleccionado {
  fecha: string;
  hora: string;
}

interface Doctor {
  id: number;
  username: string;
  especialidad: string;
  role: string;
  active: boolean;
}

interface HorarioDisponible {
  hora: string;
  consultorioId: number;
  doctorId: number;
}

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    CitaHorarioSelectorComponent // Asegúrate de que este componente sea standalone
  ] as const, // Agregar 'as const' para ayudar con el análisis estático
  templateUrl: './cita-form.component.html',
  styleUrls: ['./cita-form.component.scss']
})
export class CitaFormComponent implements OnInit {
  citaForm: FormGroup;
  pacientes: Paciente[] = [];
  doctores: Doctor[] = [];
  consultorios: Consultorio[] = [];
  especialidades: string[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  loading = false;
  error = '';
  isEditing = false;
  consultorioAsignado = '';
  today = new Date().toISOString().split('T')[0];
  doctoresFiltrados: Doctor[] = [];
  searchTerm = '';
  pacientesFiltrados: Paciente[] = [];
  showResults = false;
  consultorioSeleccionado: any = null;
  citasExistentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.citaForm = this.fb.group({
      pacienteId: ['', Validators.required],
      pacienteBuscador: [''],
      especialidad: ['', Validators.required],
      doctorId: ['', Validators.required],
      consultorioId: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: [{ value: '', disabled: false }, Validators.required],
      notas: ['']
    });

    // Deshabilitar campos que dependen de selecciones previas
    this.citaForm.get('doctorId')?.disable();
    this.citaForm.get('fecha')?.disable();
    this.citaForm.get('hora')?.disable();
  }

  

  ngOnInit(): void {
    this.isEditing = this.route.snapshot.params['id'] !== undefined;
    this.cargarDatosIniciales();

    if (this.isEditing) {
      this.cargarCita(this.route.snapshot.params['id']);
    }

    // Suscribirse a cambios en especialidad
    this.citaForm.get('especialidad')?.valueChanges.subscribe(especialidad => {
      this.citaForm.patchValue({ doctorId: '' });
      if (especialidad) {
        // Filtrar doctores por especialidad seleccionada
        this.doctoresFiltrados = this.doctores.filter(
          doctor => doctor.especialidad === especialidad && doctor.active
        );
        this.citaForm.get('doctorId')?.enable();
      } else {
        this.doctoresFiltrados = [];
        this.citaForm.get('doctorId')?.disable();
      }
      
      // Resetear campos dependientes
      this.citaForm.patchValue({
        consultorioId: '',
        fecha: '',
        hora: ''
      });
      this.consultorioAsignado = '';
      this.citaForm.get('fecha')?.disable();
      this.citaForm.get('hora')?.disable();
    });

    this.citaForm.get('pacienteBuscador')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string): Observable<Paciente[]> => {
        if (!term || term.length < 3) {
          this.pacientesFiltrados = [];
          this.showResults = false;
          return of([]);
        }
        
        console.log('Buscando:', term);
        return this.citasService.searchPacientes(term);
      })
    ).subscribe({
      next: (pacientes: Paciente[]) => {
        console.log('Pacientes encontrados:', pacientes);
        this.pacientesFiltrados = pacientes;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.error = 'Error al buscar pacientes';
        this.pacientesFiltrados = [];
        this.showResults = false;
      }
    });

   // Suscribirse a cambios en doctorId
   this.citaForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
    if (doctorId) {
      const doctorSeleccionado = this.doctores.find(d => d.id === Number(doctorId));
      console.log('Doctor seleccionado:', doctorSeleccionado);
      
      if (doctorSeleccionado) {
        // Buscar el consultorio en la lista ya cargada
        const consultorioAsignado = this.consultorios.find(c => c.doctorId === doctorSeleccionado.id);
        
        if (consultorioAsignado) {
          this.consultorioSeleccionado = consultorioAsignado;
          this.consultorioAsignado = `Consultorio ${consultorioAsignado.numero}${
            consultorioAsignado.descripcion ? ' - ' + consultorioAsignado.descripcion : ''
          }`;
          this.citaForm.patchValue({ consultorioId: consultorioAsignado.id });
          
          // Cargar citas existentes para este consultorio
          this.citasService.getCitasByConsultorio(consultorioAsignado.id).subscribe({
            next: (citas) => {
              this.citasExistentes = citas;
              console.log('Citas existentes cargadas:', this.citasExistentes);
            },
            error: (error) => {
              console.error('Error al cargar citas existentes:', error);
              this.error = 'Error al cargar horarios disponibles';
            }
          });
        } else {
          this.consultorioAsignado = 'No tiene consultorio asignado';
          this.consultorioSeleccionado = null;
          this.citaForm.patchValue({ consultorioId: '' });
        }
      }
    } else {
      this.consultorioAsignado = '';
      this.consultorioSeleccionado = null;
      this.citaForm.patchValue({ consultorioId: '' });
    }


  // Resetear campos dependientes
  this.citaForm.patchValue({
    fecha: '',
    hora: ''
  });
  this.horariosDisponibles = [];
  this.citaForm.get('hora')?.disable();
});

    // Suscribirse a cambios en fecha
    this.citaForm.get('fecha')?.valueChanges.subscribe(fecha => {
      this.citaForm.patchValue({ hora: '' });
      if (fecha) {
        const doctorId = this.citaForm.get('doctorId')?.value;
        const consultorioId = this.citaForm.get('consultorioId')?.value;
        
        if (doctorId && consultorioId) {
          this.loading = true;
          this.citasService.getHorariosDisponibles(consultorioId, fecha, doctorId).subscribe({
            next: (horarios) => {
              this.horariosDisponibles = horarios;
              this.citaForm.get('hora')?.enable();
              this.loading = false;
            },
            error: (error) => {
              console.error('Error al obtener horarios:', error);
              this.error = 'Error al obtener horarios disponibles';
              this.loading = false;
            }
          });
        }
      } else {
        this.horariosDisponibles = [];
        this.citaForm.get('hora')?.disable();
      }
    });
  }

  cargarDatosIniciales() {
    this.loading = true;
    this.error = '';
  
    // Cargar pacientes
    this.citasService.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.error = 'Error al cargar los pacientes';
        this.loading = false;
      }
    });
  
    // Cargar consultorios y doctores
    this.citasService.getConsultorios().subscribe({
      next: (consultorios) => {
        this.consultorios = consultorios;
        
        // Cargar doctores después de tener los consultorios
        this.citasService.getDoctores().subscribe({
          next: (doctores) => {
            this.doctores = doctores.filter(d => d.active);
            
            // Inicializar doctoresFiltrados como vacío
            this.doctoresFiltrados = [];
            
            this.especialidades = Array.from(new Set(
              this.doctores
                .map(d => d.especialidad)
                .filter((esp): esp is string => esp !== undefined)
            ));
            
            // Si estamos editando, cargar la cita
            if (this.isEditing) {
              this.cargarCita(this.route.snapshot.params['id']);
            }
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al cargar doctores:', error);
            this.error = 'Error al cargar los doctores';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar consultorios:', error);
        this.error = 'Error al cargar los consultorios';
        this.loading = false;
      }
    });
  }
  selectPaciente(paciente: Paciente) {
    console.log('Paciente seleccionado:', paciente);
    this.citaForm.patchValue({
      pacienteId: paciente.id,
      pacienteBuscador: `${paciente.primer_nombre} ${paciente.apellido_paterno} - ${paciente.cedula}`
    });
    this.showResults = false;
    this.pacientesFiltrados = []; 
  }

  cargarCita(id: number) {
    this.loading = true;
    this.citasService.getCitaById(id).subscribe({
      next: (cita) => {
        // Establecer especialidad si el doctor existe
        const doctor = this.doctores.find(d => d.id === cita.doctorId);
        if (doctor) {
          this.citaForm.patchValue({ especialidad: doctor.especialidad });
        }
  
        // Habilitar campos necesarios antes de establecer valores
        this.citaForm.get('doctorId')?.enable();
        
        // Buscar el consultorio
        const consultorio = this.consultorios.find(c => c.id === cita.consultorioId);
        if (consultorio) {
          this.consultorioSeleccionado = consultorio;
          // Cargar citas existentes
          this.citasService.getCitasByConsultorio(consultorio.id).subscribe({
            next: (citas) => {
              this.citasExistentes = citas.filter(c => c.id !== id); // Excluir la cita actual
              
              // Establecer valores del formulario
              this.citaForm.patchValue({
                pacienteId: cita.pacienteId,
                consultorioId: cita.consultorioId,
                doctorId: cita.doctorId,
                fecha: cita.fecha,
                hora: cita.hora,
                notas: cita.notas
              });
  
              // Cargar el nombre del paciente en el buscador
              const paciente = this.pacientes.find(p => p.id === cita.pacienteId);
              if (paciente) {
                this.citaForm.patchValue({
                  pacienteBuscador: `${paciente.primer_nombre} ${paciente.apellido_paterno} - ${paciente.cedula}`
                });
              }
  
              // Habilitar campos dependientes
              this.citaForm.get('fecha')?.enable();
              this.citaForm.get('hora')?.enable();
            }
          });
        }
  
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar la cita';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  onHorarioSeleccionado(evento: {fecha: string, hora: string}) {
    this.citaForm.patchValue({
      fecha: evento.fecha,
      hora: evento.hora
    });
  }

  onSubmit() {
    if (this.citaForm.valid) {
      const citaData = {
        pacienteId: this.citaForm.get('pacienteId')?.value,
        consultorioId: this.citaForm.get('consultorioId')?.value,
        doctorId: this.citaForm.get('doctorId')?.value,
        fecha: this.citaForm.get('fecha')?.value,
        hora: this.citaForm.get('hora')?.value,
        notas: this.citaForm.get('notas')?.value
      };

      console.log('Datos del formulario a enviar:', citaData);

      this.loading = true;
      if (this.isEditing) {
        // Si estamos editando
        this.citasService.updateCita(this.route.snapshot.params['id'], citaData).subscribe({
          next: (response) => {
            console.log('Cita actualizada:', response);
            this.router.navigate(['/secretaria/citas']);
          },
          error: (error) => {
            console.error('Error al actualizar cita:', error);
            this.error = 'Error al actualizar la cita: ' + (error.error?.message || error.message);
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      } else {
        // Si estamos creando una nueva cita
        this.citasService.createCita(citaData).subscribe({
          next: (response) => {
            console.log('Cita creada:', response);
            this.router.navigate(['/secretaria/citas']);
          },
          error: (error) => {
            console.error('Error al crear cita:', error);
            this.error = 'Error al crear la cita: ' + (error.error?.message || error.message);
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.citaForm.controls).forEach(key => {
        const control = this.citaForm.get(key);
        control?.markAsTouched();
      });
      
      console.log('Formulario inválido:', this.citaForm.errors);
      console.log('Estado de los controles:', {
        pacienteId: this.citaForm.get('pacienteId')?.errors,
        consultorioId: this.citaForm.get('consultorioId')?.errors,
        doctorId: this.citaForm.get('doctorId')?.errors,
        fecha: this.citaForm.get('fecha')?.errors,
        hora: this.citaForm.get('hora')?.errors
      });
    }
  }

  cancelar() {
    this.router.navigate(['/secretaria/citas']);
  }
  agregarPaciente() {
    this.router.navigate(['/patients/new']);
  }
}