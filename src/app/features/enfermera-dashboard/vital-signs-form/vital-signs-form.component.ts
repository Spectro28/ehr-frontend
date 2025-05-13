import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VitalSignsService } from '../../../core/services/vital-signs.service';
import { CommonModule } from '@angular/common';

// Interfaces
interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
}

interface VitalSigns {
  id: number;
  fecha_medicion: string;
  temperatura: number;
  presion_arterial: string;
  pulso: number;
  frecuencia_respiratoria: number;
  peso: number;
  talla: number;
  citaId: number;
  pacienteId: number;
  paciente?: Paciente;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Component({
  selector: 'app-vital-signs-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vital-signs-form.component.html',
  styleUrls: ['./vital-signs-form.component.css']
})
export class VitalSignsFormComponent implements OnInit {
  vitalSignsForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  citaId: number | null = null;
  pacienteId: number | null = null;
  isEditMode = false;
  recordId: number | null = null;
  pacienteNombre: string = '';
  pacienteCedula: string = '';

  constructor(
    private fb: FormBuilder,
    private vitalSignsService: VitalSignsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.vitalSignsForm = this.fb.group({
      fecha_medicion: ['', Validators.required],
      temperatura: ['', [Validators.required, Validators.min(30), Validators.max(45)]],
      presion_arterial: ['', [Validators.required, Validators.pattern('^\\d{2,3}\\/\\d{2,3}$')]],
      pulso: ['', [Validators.required, Validators.min(40), Validators.max(200)]],
      frecuencia_respiratoria: ['', [Validators.required, Validators.min(8), Validators.max(40)]],
      peso: ['', [Validators.required, Validators.min(0)]],
      talla: ['', [Validators.required, Validators.min(30), Validators.max(250)]]
    });
  }

  ngOnInit() {
    console.log('Iniciando componente VitalSignsForm');
    
    // Verificar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.recordId = +params['id'];
        this.loadVitalSigns(this.recordId);
      } else {
        // Si no es modo edición, proceder con la lógica existente para nuevo registro
        this.route.queryParams.subscribe(params => {
          const citaId = params['citaId'];
          if (citaId) {
            this.citaId = +citaId;
            this.loadCitaDetails(this.citaId);
          }
        });
      }
    });

    // Establecer fecha actual solo para nuevos registros
    if (!this.isEditMode) {
      this.vitalSignsForm.patchValue({
        fecha_medicion: new Date().toISOString().split('T')[0]
      });
    }
  }

  loadCitaDetails(citaId: number) {
    console.log('Iniciando loadCitaDetails con ID:', citaId);
    this.vitalSignsService.getCitaDetails(citaId).subscribe({
        next: (cita) => {
            console.log('Datos de la cita recibidos:', cita);
            if (cita && cita.pacienteId) {
                this.pacienteId = cita.pacienteId;
                console.log('ID del paciente extraído:', this.pacienteId);
                if (this.pacienteId !== null) {
                    this.loadPacienteDetails(this.pacienteId);
                }
            } else {
                console.error('La cita no contiene ID del paciente:', cita);
                this.error = 'No se pudo obtener la información del paciente';
            }
        },
        error: (error) => {
            console.error('Error al cargar detalles de la cita:', error);
            this.error = 'Error al cargar detalles de la cita';
        }
    });
}

  calculateIMC(): number {
    const peso = this.vitalSignsForm.get('peso')?.value;
    const talla = this.vitalSignsForm.get('talla')?.value;
    
    if (peso && talla) {
      const tallaMetros = talla / 100;
      return peso / (tallaMetros * tallaMetros);
    }
    return 0;
  }

  loadVitalSigns(id: number) {
    this.loading = true;
    this.vitalSignsService.getById(id).subscribe({
      next: (data) => {
        console.log('Datos cargados:', data);
        this.vitalSignsForm.patchValue({
          fecha_medicion: new Date(data.fecha_medicion).toISOString().split('T')[0],
          temperatura: data.temperatura,
          presion_arterial: data.presion_arterial,
          pulso: data.pulso,
          frecuencia_respiratoria: data.frecuencia_respiratoria,
          peso: data.peso,
          talla: data.talla
        });
        this.citaId = data.citaId;
        this.pacienteId = data.pacienteId;
        
        // Verificar que pacienteId no sea null antes de llamar
        if (this.pacienteId !== null) {
          this.loadPacienteDetails(this.pacienteId);
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los datos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  loadPacienteDetails(pacienteId: number) {
    this.vitalSignsService.getPacienteDetails(pacienteId).subscribe({
        next: (response) => {
            console.log('Respuesta completa del paciente:', response);
            
            // Acceder directamente a los campos como vienen en la respuesta
            const primerNombre = response.primer_nombre || '';
            const apellidoPaterno = response.apellido_paterno || '';
            
            this.pacienteNombre = `${primerNombre} ${apellidoPaterno}`.trim();
            this.pacienteCedula = response.cedula;

            console.log('Datos procesados:', {
                nombreCompleto: this.pacienteNombre,
                cedula: this.pacienteCedula,
                datosOriginales: response
            });
        },
        error: (error) => {
            console.error('Error al cargar detalles del paciente:', error);
            this.error = 'Error al cargar detalles del paciente';
        }
    });
}

  onSubmit() {
    if (this.vitalSignsForm.valid) {
      const formData = {
        ...this.vitalSignsForm.value,
        citaId: this.citaId,
        pacienteId: this.pacienteId,
        fecha_medicion: new Date(this.vitalSignsForm.value.fecha_medicion)
      };

      this.loading = true;

      if (this.isEditMode && this.recordId) {
        // Actualizar registro existente
        this.vitalSignsService.update(this.recordId, formData).subscribe({
          next: (response) => {
            console.log('Actualización exitosa:', response);
            this.success = 'Signos vitales actualizados correctamente';
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/enfermera']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error en la actualización:', error);
            this.error = error.error?.message || 'Error al actualizar los signos vitales';
            this.loading = false;
          }
        });
      } else {
        // Crear nuevo registro
        this.vitalSignsService.create(formData).subscribe({
          next: (response) => {
            console.log('Registro exitoso:', response);
            this.success = 'Signos vitales guardados correctamente';
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/enfermera']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error en el registro:', error);
            this.error = error.error?.message || 'Error al guardar los signos vitales';
            this.loading = false;
          }
        });
      }
    } else {
      this.error = 'Por favor, complete todos los campos correctamente';
      Object.keys(this.vitalSignsForm.controls).forEach(key => {
        const control = this.vitalSignsForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}