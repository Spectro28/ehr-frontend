import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicoService } from '../../../core/services/medico.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
interface Diagnostico {
  id: number;
  cieId: number;
  codigo: string;
  nombre: string;
  tipo: string;
}
interface CIE {
  ID: number;
  CODIGO: string;
  NOMBRE: string;
}
interface Medicamento {
  id: number;
  fecha_emision: string;
  nombre_generico: string;
  concentracion: string;
  forma_farmaceutica: string;
  dosis: string;
  frecuencia: string;
  duracion_tratamiento: string;
  via_administracion: string;
  indicaciones_adicionales?: string;
}
@Component({
  selector: 'app-evolucion-medica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule, FormsModule],
  templateUrl: './evolucion-medica.component.html',
  styleUrls: ['./evolucion-medica.component.css']
})
export class EvolucionMedicaComponent implements OnInit {
  evolucionForm!: FormGroup;
  prescripcionForm!: FormGroup;
  pacienteId: number | null = null;
  evolucionId: number | null = null;
  isEditMode = false;
  canEdit = false;
  loading = false;
  error = '';
  success = '';
  pacienteNombre = '';
  pacienteCedula = '';
  signosVitales: any = null;
  diagnosticoForm!: FormGroup;
  cieSuggestions: CIE[] = [];
  selectedDiagnosticoIndex: number = -1;
  showSuggestions = false;
  medicamentosSugeridos: any[] = [];
  mostrarSugerenciasMedicamentos = false;
  medicoAutor: string = '';
  searchTerm: string = '';
  modalVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForms();
  }
  
  

  private initializeForms() {
    this.evolucionForm = this.fb.group({
      motivo_consulta: [''],
      enfermedad_actual: [''],
      antecedentes_personales: [''],
      antecedentes_familiares: this.fb.group({
        cardiopatia: [false],
        diabetes: [false],
        enfermedad_cardiovascular: [false],
        hipertension: [false],
        cancer: [false],
        tuberculosis: [false],
        enfermedad_mental: [false],
        enfermedad_infecciosa: [false],
        otro_antecedente: [false],
        descripcion_otro: [''],
        sin_antecedentes: [false]
      })
    });
  
    this.diagnosticoForm = this.fb.group({
      diagnosticos: this.fb.array([])
    });
  
    this.prescripcionForm = this.fb.group({
      medicamentos: this.fb.array([])
    });
  }

  get diagnosticos() {
    return this.diagnosticoForm.get('diagnosticos') as FormArray;
  }

  get medicamentos() {
    return this.prescripcionForm.get('medicamentos') as FormArray;
  }


  agregarDiagnostico() {
    if (this.canEdit) {
      const diagnosticoGroup = this.fb.group({
        id: [null],
        cieId: ['', Validators.required],
        codigo: ['', Validators.required],
        nombre: ['', Validators.required],
        tipo: ['PRE', Validators.required]
      });
      this.diagnosticos.push(diagnosticoGroup);
    }
  }
  

  eliminarDiagnostico(index: number) {
    if (this.canEdit) {
      this.diagnosticos.removeAt(index);
    }
  }

  mostrarBusquedaCIE() {
    this.modalVisible = true;
    this.searchTerm = '';
    this.cieSuggestions = [];
    this.agregarDiagnostico();
    this.selectedDiagnosticoIndex = this.diagnosticos.length - 1;
  }

  buscarCIE(event: any, index: number) {
    const termino = event.target.value;
    this.selectedDiagnosticoIndex = index;
    
    if (termino && termino.length > 2) {
      this.medicoService.buscarCIE(termino).subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.cieSuggestions = response;
          } else if (response.data && Array.isArray(response.data)) {
            this.cieSuggestions = response.data;
          }
        },
        error: (error) => {
          console.error('Error al buscar CIE:', error);
          this.cieSuggestions = [];
        }
      });
    } else {
      this.cieSuggestions = [];
    }
  }
  seleccionarCIE(cie: CIE, index: number) {
    const diagnosticoGroup = this.diagnosticos.at(index);
    if (diagnosticoGroup) {
      diagnosticoGroup.patchValue({
        cieId: cie.ID,
        codigo: cie.CODIGO,
        nombre: cie.NOMBRE
      });
    }
    this.cieSuggestions = [];
  }
  
  agregarMedicamento() {
    if (this.canEdit) {
      const medicamentoForm = this.fb.group({
        fecha_emision: [new Date().toISOString().split('T')[0]],
        nombre_generico: [''],
        concentracion: [''],
        forma_farmaceutica: [''],
        dosis: [''],
        frecuencia: [''],
        duracion_tratamiento: [''],
        via_administracion: [''],
        indicaciones_adicionales: ['']
      });
      this.medicamentos.push(medicamentoForm);
    }
  }

  eliminarMedicamento(index: number) {
    if (this.canEdit) {
      this.medicamentos.removeAt(index);
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.evolucionId = +params['id'];
        this.isEditMode = true;
        this.cargarEvolucion();
      } else {
        // Si no hay ID, estamos creando una nueva evolución
        this.canEdit = true;
      }
    });
  
    this.route.queryParams.subscribe(params => {
      if (params['pacienteId']) {
        this.pacienteId = +params['pacienteId'];
        this.cargarDatosPaciente();
      }
    });
  }

  onSubmit() {
    console.log('Estado del formulario:', this.evolucionForm.valid, this.diagnosticoForm.valid);
    console.log('Valores del formulario:', this.evolucionForm.value);
    console.log('Valores de diagnósticos:', this.diagnosticoForm.value);
    console.log('Valores de medicamentos:', this.medicamentos.value);
    console.log('PacienteId:', this.pacienteId);
    console.log('SignosVitales:', this.signosVitales);
  
    if (this.evolucionForm.valid && this.diagnosticoForm.valid) {
        this.loading = true;
  
        // Construir el objeto de datos
        const evolucionData = {
            motivo_consulta: this.evolucionForm.get('motivo_consulta')?.value,
            enfermedad_actual: this.evolucionForm.get('enfermedad_actual')?.value,
            antecedentes_personales: this.evolucionForm.get('antecedentes_personales')?.value,
            antecedentes_familiares: this.evolucionForm.get('antecedentes_familiares')?.value,
            pacienteId: Number(this.pacienteId),
            medicoId: Number(this.medicoService.obtenerMedicoActualId()),
            signosVitalesId: this.signosVitales?.id ? Number(this.signosVitales.id) : null,
            fecha: new Date().toISOString(),
            medicamentos: this.medicamentos.value,
            diagnosticos: this.diagnosticos.value.map((diag: any) => ({
                cieId: diag.cieId,
                tipo: diag.tipo
            }))
        };
  
        // Verificar campos requeridos básicos
        if (!evolucionData.motivo_consulta || 
            !evolucionData.enfermedad_actual || 
            !evolucionData.antecedentes_personales || 
            !evolucionData.pacienteId || 
            !evolucionData.signosVitalesId ||
            !evolucionData.diagnosticos.length) {
            
            this.error = 'Faltan campos requeridos:';
            if (!evolucionData.motivo_consulta) this.error += ' motivo_consulta,';
            if (!evolucionData.enfermedad_actual) this.error += ' enfermedad_actual,';
            if (!evolucionData.antecedentes_personales) this.error += ' antecedentes_personales,';
            if (!evolucionData.pacienteId) this.error += ' pacienteId,';
            if (!evolucionData.signosVitalesId) this.error += ' signosVitalesId,';
            if (!evolucionData.diagnosticos.length) this.error += ' diagnósticos,';
            this.loading = false;
            return;
        }

        // Verificar que los diagnósticos tengan los campos requeridos
        const diagnosticosInvalidos = evolucionData.diagnosticos.some((diag: any) => 
            !diag.cieId || !diag.tipo
        );

        if (diagnosticosInvalidos) {
            this.error = 'Todos los diagnósticos deben tener un código CIE y un tipo seleccionado';
            this.loading = false;
            return;
        }

        // Verificar que haya al menos un medicamento
        if (!evolucionData.medicamentos || evolucionData.medicamentos.length === 0) {
            this.error = 'Debe agregar al menos un medicamento';
            this.loading = false;
            return;
        }

        // Verificar que los medicamentos tengan todos los campos requeridos
        const medicamentosInvalidos = evolucionData.medicamentos.some((med: any) => 
            !med.fecha_emision ||
            !med.nombre_generico ||
            !med.concentracion ||
            !med.forma_farmaceutica ||
            !med.dosis ||
            !med.frecuencia ||
            !med.duracion_tratamiento ||
            !med.via_administracion
        );

        if (medicamentosInvalidos) {
            this.error = 'Todos los medicamentos deben tener los campos requeridos completos';
            this.loading = false;
            return;
        }
  
        // Asegurarnos de que los IDs sean números
        const datosFinales = {
            ...evolucionData,
            pacienteId: Number(evolucionData.pacienteId),
            medicoId: Number(evolucionData.medicoId),
            signosVitalesId: Number(evolucionData.signosVitalesId),
            diagnosticos: evolucionData.diagnosticos.map((diag: any) => ({
                ...diag,
                cieId: Number(diag.cieId)
            })),
            medicamentos: evolucionData.medicamentos.map((med: any) => ({
                ...med,
                fecha_emision: med.fecha_emision || new Date().toISOString().split('T')[0]
            }))
        };
  
        console.log('Datos finales a enviar:', datosFinales);
  
        const request = this.isEditMode ? 
            this.medicoService.actualizarEvolucion(this.evolucionId!, datosFinales) :
            this.medicoService.crearEvolucion(datosFinales);
  
        request.subscribe({
            next: (response) => {
                console.log('Respuesta exitosa:', response);
                this.success = 'Evolución guardada exitosamente';
                this.loading = false;
                setTimeout(() => {
                    this.router.navigate(['/doctor']);
                }, 2000);
            },
            error: (error) => {
                console.error('Error detallado:', error);
                this.error = `Error al guardar la evolución: ${error.error?.message || error.message}`;
                this.loading = false;
            }
        });
    } else {
        // Mostrar errores de validación
        Object.keys(this.evolucionForm.controls).forEach(key => {
            const control = this.evolucionForm.get(key);
            if (control?.errors) {
                console.log(`Errores en ${key}:`, control.errors);
            }
        });

        // Verificar errores en diagnósticos
        if (this.diagnosticos.controls.length === 0) {
            console.log('Error: No hay diagnósticos agregados');
        } else {
            this.diagnosticos.controls.forEach((control, index) => {
                if (control.errors) {
                    console.log(`Errores en diagnóstico ${index}:`, control.errors);
                }
            });
        }

        // Verificar errores en medicamentos
        if (this.medicamentos.controls.length === 0) {
            console.log('Error: No hay medicamentos agregados');
        } else {
            this.medicamentos.controls.forEach((control, index) => {
                if (control.errors) {
                    console.log(`Errores en medicamento ${index}:`, control.errors);
                }
            });
        }

        this.error = 'Por favor, complete todos los campos requeridos incluyendo al menos un diagnóstico y un medicamento';
    }
}

private cargarEvolucion() {
  if (this.evolucionId) {
    this.loading = true;
    this.medicoService.obtenerEvolucion(this.evolucionId).subscribe({
      next: (response) => {
        if (response.data) {
          // Verificar si el médico actual es el autor
          const medicoActualId = this.medicoService.obtenerMedicoActualId();
          this.canEdit = response.data.medicoId === medicoActualId;

          // Cargar datos básicos en evolucionForm
          this.evolucionForm.patchValue({
            motivo_consulta: response.data.motivo_consulta,
            enfermedad_actual: response.data.enfermedad_actual,
            antecedentes_personales: response.data.antecedentes_personales,
            antecedentes_familiares: response.data.antecedentes_familiares
          });

          // Cargar diagnósticos
          const diagnosticosArray = this.diagnosticoForm.get('diagnosticos') as FormArray;
          diagnosticosArray.clear();
          if (response.data.diagnosticos && response.data.diagnosticos.length > 0) {
            response.data.diagnosticos.forEach((diagnostico: Diagnostico) => {
              diagnosticosArray.push(this.fb.group({
                id: [diagnostico.id],
                cieId: [diagnostico.cieId],
                codigo: [diagnostico.codigo],
                nombre: [diagnostico.nombre],
                tipo: [diagnostico.tipo]
              }));
            });
          }

          // Cargar medicamentos con tipo específico
          const medicamentosArray = this.prescripcionForm.get('medicamentos') as FormArray;
          medicamentosArray.clear();
          if (response.data.medicamentos && response.data.medicamentos.length > 0) {
            response.data.medicamentos.forEach((medicamento: Medicamento) => {
              medicamentosArray.push(this.fb.group({
                id: [medicamento.id],
                fecha_emision: [medicamento.fecha_emision],
                nombre_generico: [medicamento.nombre_generico],
                concentracion: [medicamento.concentracion],
                forma_farmaceutica: [medicamento.forma_farmaceutica],
                dosis: [medicamento.dosis],
                frecuencia: [medicamento.frecuencia],
                duracion_tratamiento: [medicamento.duracion_tratamiento],
                via_administracion: [medicamento.via_administracion],
                indicaciones_adicionales: [medicamento.indicaciones_adicionales]
              }));
            });
          }

          // Cargar datos del paciente
          if (response.data.paciente) {
            this.pacienteId = response.data.paciente.id;
            this.pacienteNombre = `${response.data.paciente.primer_nombre} ${response.data.paciente.apellido_paterno}`;
            this.pacienteCedula = response.data.paciente.cedula;
          }

          // Cargar signos vitales
          if (response.data.signosVitales) {
            this.signosVitales = response.data.signosVitales;
          }

          // Habilitar/deshabilitar formularios según permisos
          if (!this.canEdit) {
            this.evolucionForm.disable();
            this.diagnosticoForm.disable();
            this.prescripcionForm.disable();
          }

          console.log('Estado final de los formularios:', {
            evolucionForm: this.evolucionForm.value,
            diagnosticos: this.diagnosticos.value,
            medicamentos: this.medicamentos.value
          });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar la evolución:', error);
        this.error = 'Error al cargar la evolución';
        this.loading = false;
      }
    });
  }
}

verEvolucionesPaciente(pacienteId: number) {
  this.router.navigate(['/doctor/evoluciones-paciente', pacienteId]);
}

  private cargarDatosPaciente() {
    if (this.pacienteId) {
      this.loading = true;
      this.medicoService.getPacientesConSignos().subscribe({
        next: (response) => {
          console.log('Datos del paciente recibidos:', response);
          
          const paciente = response.data.find((p: any) => p.id === this.pacienteId);
          
          if (paciente) {
            console.log('Paciente encontrado:', paciente);
            this.pacienteNombre = `${paciente.primer_nombre} ${paciente.apellido_paterno}`;
            this.pacienteCedula = paciente.cedula;
            
            if (paciente.signosVitales && paciente.signosVitales.length > 0) {
              this.signosVitales = paciente.signosVitales[0];
              console.log('Signos vitales asignados:', this.signosVitales);
            } else {
              this.error = 'El paciente debe tener signos vitales registrados para crear una evolución';
            }
          } else {
            this.error = 'No se encontró el paciente';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del paciente:', error);
          this.error = 'Error al cargar los datos del paciente';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se ha especificado un paciente';
    }
  }

  buscarMedicamento(event: any, index: number) {
    const termino = event.target.value;
    this.selectedDiagnosticoIndex = index;
    
    if (termino && termino.length > 2) {
      this.medicoService.buscarMedicamentos(termino).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.medicamentosSugeridos = response.data;
            this.mostrarSugerenciasMedicamentos = true;
          }
        },
        error: (error) => {
          console.error('Error al buscar medicamentos:', error);
        }
      });
    } else {
      this.medicamentosSugeridos = [];
      this.mostrarSugerenciasMedicamentos = false;
    }
  }

  seleccionarMedicamento(medicamento: any, index: number) {
    console.log('Medicamento seleccionado:', medicamento);
    const medicamentoForm = this.medicamentos.at(index);
    medicamentoForm.patchValue({
      nombre_generico: medicamento.nombre_generico,
      concentracion: medicamento.concentracion,
      forma_farmaceutica: medicamento.forma_farmaceutica,
      via_administracion: medicamento.via_administracion
    });
    this.mostrarSugerenciasMedicamentos = false;
  }

}
