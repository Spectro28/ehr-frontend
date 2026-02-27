import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicoService } from '../../../core/services/medico.service';
import { OdontogramaService } from '../../../core/services/odontograma.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface Diagnostico {
  id: number;
  cieId: number;
  cieid?: number;
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
  nombre_comercial?: string;
  concentracion: string;
  forma_farmaceutica: string;
  dosis: string;
  frecuencia: string;
  duracion_tratamiento: string;
  via_administracion: string;
  indicaciones_adicionales?: string;
}

interface NombreComercial {
  id: number;
  medicamento_id: number;
  nombre_comercial: string;
  estado: boolean;
}
import { OdontogramaComponent } from '../pages/odontograma/odontograma.component';
import { ExamenFisicoComponent } from '../examen-fisico/examen-fisico.component';
import { ExamenFisicoService } from '../../../core/services/examen-fisico.service';
import { Odontograma, PiezaDental } from '../../../core/interfaces';

// Interfaz extendida para las piezas del odontograma con propiedades adicionales
interface PiezaOdontograma extends PiezaDental {
  cara?: string;
  diagnostico?: string | { nombre: string; codigo: string };
  procedimiento?: string | { nombre: string; codigo: string };
}

@Component({
  selector: 'app-evolucion-medica',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    FormsModule,
    OdontogramaComponent,
    ExamenFisicoComponent
  ],
  templateUrl: './evolucion-medica.component.html',
  styleUrls: ['./evolucion-medica.component.css']
})
export class EvolucionMedicaComponent implements OnInit {
  @ViewChild('odontogramaComponent') odontogramaComponentRef!: any;
  @ViewChild(ExamenFisicoComponent) examenFisicoRef!: any;
  
  evolucionForm!: FormGroup;
  prescripcionForm!: FormGroup;
  pacienteId: number = 0;
  evolucionId: number = 0;
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
  modalNombreComercialVisible: boolean = false;
  indiceMedicamentoActual: number = -1;
  nuevoNombreComercial: string = '';
  medicamentoSeleccionado: any[] = [];
  nombresComerciales: NombreComercial[][] = [];
  mostrarTodos: boolean[] = [];

  canEditOdontograma = false;
  odontogramaId: number = 0;
  showOdontograma = false;
  odontogramaActual: Odontograma | null = null;

  constructor(
    private fb: FormBuilder,
    private medicoService: MedicoService,
    private odontogramaService: OdontogramaService,
    private route: ActivatedRoute,
    private router: Router,
    private examenFisicoService: ExamenFisicoService
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
        nombre_comercial: [''],
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
        // Verificar permisos para el odontograma
        this.canEditOdontograma = this.odontogramaService.canEditOdontograma();
        
        // Mostrar odontograma siempre
        this.showOdontograma = true;
      }
    });
  }

  onSubmit() {
    // Verificar si el usuario es dentista y solo está trabajando con el odontograma
    if (this.canEditOdontograma && this.odontogramaService.canEditOdontograma()) {
      // Si estamos en modo edición, actualizar la evolución existente
      if (this.isEditMode) {
        this.guardarOdontogramaEnEvolucion();
        return;
      } else {
        // Si es nueva evolución, crear una nueva
        this.guardarOdontogramaYCrearEvolucion();
        return;
      }
    }

    // Si hay odontograma pendiente, guardarlo primero
    if (this.odontogramaActual && this.odontogramaActual.id) {
      this.guardarOdontogramaEnEvolucion();
      return;
    }

    // Si no es un dentista trabajando solo con el odontograma, validar la evolución completa
    console.log('Estado del formulario:', this.evolucionForm.valid, this.diagnosticoForm.valid);
    console.log('Valores del formulario:', this.evolucionForm.value);
    console.log('Valores de diagnósticos:', this.diagnosticoForm.value);
    console.log('Valores de medicamentos:', this.medicamentos.value);
    console.log('PacienteId:', this.pacienteId);
    console.log('SignosVitales:', this.signosVitales);
  
    // Validar evolución completa solo si no es un dentista trabajando en el odontograma
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
            odontogramaId: this.odontogramaId,
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

        // Verificar que haya al menos un medicamento (excepto para dentistas trabajando solo con odontograma)
        if (!this.canEditOdontograma && (!evolucionData.medicamentos || evolucionData.medicamentos.length === 0)) {
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
  
        const examenFisicoPayload = this.examenFisicoRef ? this.examenFisicoRef.getPayload() : null;
        const request = this.isEditMode ? 
            this.medicoService.actualizarEvolucion(this.evolucionId!, datosFinales) :
            this.medicoService.crearEvolucion(datosFinales);
  
        request.subscribe({
            next: async (response) => {
                console.log('Evolución guardada exitosamente:', response);

                // Guardar Examen Físico si hay datos - con mejor manejo de errores y sincronización
                const evolucionId = this.isEditMode ? this.evolucionId : (response?.data?.id || response?.id);

                if (evolucionId && this.examenFisicoRef && examenFisicoPayload && examenFisicoPayload.items?.length) {
                  console.log('Guardando examen físico para evolución:', evolucionId);

                  try {
                    // Esperar que el componente de examen físico esté listo
                    const isReady = await this.examenFisicoRef.waitForComponentReady(3000);
                    if (!isReady) {
                      console.warn('Componente de examen físico no está listo, intentando guardar de todas formas');
                    }

                    // Obtener el payload actualizado después de esperar
                    const updatedPayload = this.examenFisicoRef.getPayload();
                    if (updatedPayload && updatedPayload.items?.length) {
                      updatedPayload.evolucionId = Number(evolucionId);

                      this.examenFisicoRef.svc.upsert(updatedPayload).subscribe({
                        next: (examenResponse: any) => {
                          console.log('Examen físico guardado exitosamente:', examenResponse);
                          this.success = 'Evolución y examen físico guardados exitosamente';
                        },
                        error: (examenError: any) => {
                          console.error('Error al guardar examen físico:', examenError);
                          // No bloquear el flujo si falla el examen físico
                          this.error = 'Evolución guardada pero hubo un error al guardar el examen físico';
                          this.success = 'Evolución guardada exitosamente (con error en examen físico)';
                        }
                      });
                    } else {
                      console.log('No hay datos válidos en el examen físico para guardar');
                    }
                  } catch (error) {
                    console.error('Error durante la sincronización del examen físico:', error);
                    this.error = 'Evolución guardada pero hubo un error al sincronizar el examen físico';
                  }
                } else {
                  console.log('No hay examen físico para guardar o componente no disponible');
                }

                // Solo mostrar éxito si no hay errores previos
                if (!this.error) {
                  this.success = 'Evolución guardada exitosamente';
                }

                this.loading = false;
                setTimeout(() => {
                    this.router.navigate(['/doctor']);
                }, 2000);
            },
            error: (error) => {
                console.error('Error detallado al guardar evolución:', error);
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

          // Si hay un odontograma asociado, actualizamos el ID y cargamos el odontograma
          if (response.data.odontograma && response.data.odontograma.id) {
            this.odontogramaId = response.data.odontograma.id;
            this.odontogramaActual = response.data.odontograma;
          }
          
          // Verificar permisos para el odontograma y examen físico
          this.canEditOdontograma = this.odontogramaService.canEditOdontograma();
          
          // Mostrar odontograma si hay uno asociado o si es un dentista
          this.showOdontograma = (response.data.odontograma && response.data.odontograma.id) || this.canEditOdontograma;

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
                cieId: [diagnostico.cieId || diagnostico.cieid],
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
            response.data.medicamentos.forEach((medicamento: Medicamento, index: number) => {
              medicamentosArray.push(this.fb.group({
                id: [medicamento.id],
                fecha_emision: [medicamento.fecha_emision],
                nombre_generico: [medicamento.nombre_generico],
                nombre_comercial: [medicamento.nombre_comercial],
                concentracion: [medicamento.concentracion],
                forma_farmaceutica: [medicamento.forma_farmaceutica],
                dosis: [medicamento.dosis],
                frecuencia: [medicamento.frecuencia],
                duracion_tratamiento: [medicamento.duracion_tratamiento],
                via_administracion: [medicamento.via_administracion],
                indicaciones_adicionales: [medicamento.indicaciones_adicionales]
              }));
              
              // Si el medicamento tiene un nombre genérico, buscar el medicamento correspondiente
              // y cargar sus nombres comerciales
              if (medicamento.nombre_generico) {
                this.medicoService.buscarMedicamentos(medicamento.nombre_generico).subscribe({
                  next: (response) => {
                    if (response.success && response.data && response.data.length > 0) {
                      const medicamentoEncontrado = response.data[0];
                      this.medicamentoSeleccionado[index] = medicamentoEncontrado;
                      this.cargarNombresComerciales(medicamentoEncontrado.id, index);
                    }
                  },
                  error: (error) => {
                    console.error('Error al buscar medicamento para cargar nombres comerciales:', error);
                  }
                });
              }
            });
          }

          // Cargar examen físico si existe - con mejor manejo de timing
          this.cargarExamenFisicoConRetry();

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
          // Cargar examen físico si existe
          // Diferimos a afterViewInit; aquí solo dejamos preparado
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

  handleOdontogramaUpdate(odontogramaId: any) {
    this.odontogramaId = odontogramaId;
    // Asegurarnos de que el odontograma se muestre después de la primera actualización
    if (odontogramaId) {
      this.showOdontograma = true;
    }
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
    const medicamentoForm = this.medicamentos.at(index);
    if (medicamentoForm) {
    medicamentoForm.patchValue({
      nombre_generico: medicamento.nombre_generico,
      nombre_comercial: medicamento.nombre_comercial || '', // Asignar nombre comercial si existe
      concentracion: medicamento.concentracion,
      forma_farmaceutica: medicamento.forma_farmaceutica,
      via_administracion: medicamento.via_administracion
    });

      // Guardar el medicamento seleccionado
      this.medicamentoSeleccionado[index] = medicamento;

      // Cargar nombres comerciales
      this.cargarNombresComerciales(medicamento.id, index);
    }
    this.mostrarSugerenciasMedicamentos = false;
    this.medicamentosSugeridos = [];
  }

  // Métodos para manejar nombres comerciales
  cargarNombresComerciales(medicamentoId: number, index: number) {
    this.medicoService.getNombresComerciales(medicamentoId).subscribe({
      next: (nombres) => {
        // Incluir el nombre comercial del medicamento base si existe
        const medicamento = this.medicamentoSeleccionado[index];
        let nombresCompletos = [...nombres];

        if (medicamento && medicamento.nombre_comercial) {
          // Verificar si ya no está en la lista
          const yaExiste = nombres.some(nc => nc.nombre_comercial.toLowerCase() === medicamento.nombre_comercial.toLowerCase());
          if (!yaExiste) {
            nombresCompletos.unshift({
              id: 0, // ID especial para el nombre comercial base
              medicamento_id: medicamentoId,
              nombre_comercial: medicamento.nombre_comercial,
              estado: true
            });
          }
        }

        this.nombresComerciales[index] = nombresCompletos;
        this.mostrarTodos[index] = false;
      },
      error: (error) => {
        console.error('Error al cargar nombres comerciales:', error);
        this.nombresComerciales[index] = [];
      }
    });
  }

  agregarNombreComercial(index: number) {
    this.indiceMedicamentoActual = index;
    this.nuevoNombreComercial = '';
    this.modalNombreComercialVisible = true;
  }

  cerrarModalNombreComercial() {
    this.modalNombreComercialVisible = false;
    this.nuevoNombreComercial = '';
    this.indiceMedicamentoActual = -1;
  }

  guardarNombreComercial() {
    if (!this.nuevoNombreComercial.trim()) return;

    const medicamento = this.medicamentoSeleccionado[this.indiceMedicamentoActual];
    if (!medicamento) return;

    this.medicoService.agregarNombreComercial(medicamento.id, this.nuevoNombreComercial).subscribe({
      next: (response) => {
        // Recargar nombres comerciales
        this.cargarNombresComerciales(medicamento.id, this.indiceMedicamentoActual);
        this.cerrarModalNombreComercial();
      },
      error: (error) => {
        console.error('Error al agregar nombre comercial:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  seleccionarNombreComercial(nombre: NombreComercial, index: number) {
    console.log('Seleccionando nombre comercial:', nombre.nombre_comercial, 'para índice:', index);
    
    const medicamentoForm = this.medicamentos.at(index);
    if (medicamentoForm) {
      medicamentoForm.patchValue({
        nombre_comercial: nombre.nombre_comercial
      });
      console.log('Valor asignado al formulario:', medicamentoForm.get('nombre_comercial')?.value);
    } else {
      console.error('No se encontró el formulario de medicamento en el índice:', index);
    }
    
    // Cerrar la lista de nombres comerciales inmediatamente después de seleccionar
    this.ocultarListaNombresComerciales(index);
  }

  getNombresComercialesMostrados(index: number): NombreComercial[] {
    const nombres = this.nombresComerciales[index] || [];
    if (this.mostrarTodos[index]) {
      return nombres;
    }
    return nombres.slice(0, 3);
  }

  toggleMostrarTodos(index: number) {
    this.mostrarTodos[index] = !this.mostrarTodos[index];
  }

  // Métodos para controlar la visibilidad de la lista
  mostrarListaNombresComerciales(index: number) {
    // Solo mostrar si hay nombres comerciales disponibles
    if (this.nombresComerciales[index] && this.nombresComerciales[index].length > 0) {
      // No necesitamos hacer nada aquí, la lista se muestra automáticamente
      // cuando hay elementos en nombresComerciales[index]
    }
  }

  ocultarListaNombresComerciales(index: number) {
    this.nombresComerciales[index] = [];
  }

  // Método para verificar si debe mostrar la lista
  debeMostrarListaNombresComerciales(index: number): boolean {
    return this.nombresComerciales[index] && 
           this.nombresComerciales[index].length > 0 && 
           this.medicamentoSeleccionado[index];
  }

  // Método para manejar el cierre de listas con delay
  cerrarListaConDelay(index: number, delay: number = 200) {
    setTimeout(() => {
      this.ocultarListaNombresComerciales(index);
    }, delay);
  }

  // Método para manejar el clic en un nombre comercial
  onNombreComercialClick(nombre: NombreComercial, index: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Click en nombre comercial:', nombre.nombre_comercial);
    this.seleccionarNombreComercial(nombre, index);
  }

  onOdontogramaUpdated(odontogramaId: number) {
    console.log('Odontograma actualizado:', odontogramaId);
    // Aquí puedes agregar lógica adicional si es necesario
  }

  // Cargar odontograma existente
  private cargarOdontogramaExistente(odontogramaId: number) {
    this.odontogramaService.obtenerPorId(odontogramaId).subscribe({
      next: (odontograma) => {
        this.odontogramaActual = odontograma;
        console.log('Odontograma cargado:', odontograma);
      },
      error: (error) => {
        console.error('Error al cargar odontograma:', error);
      }
    });
  }

  // Guardar odontograma y crear evolución para dentistas
  private guardarOdontogramaYCrearEvolucion() {
    this.loading = true;
    
    // Obtener el odontograma actual del componente hijo
    const odontogramaComponent = this.odontogramaComponentRef;
    if (!odontogramaComponent || odontogramaComponent.piezasSeleccionadas.length === 0) {
      this.error = 'Debe seleccionar al menos una pieza dental para guardar el odontograma';
      this.loading = false;
      return;
    }

    // Convertir piezasSeleccionadas a la estructura esperada por el backend
    const piezasParaBackend = odontogramaComponent.piezasSeleccionadas.map((pieza: any) => ({
      numeroPieza: pieza.numeroPieza,
      caras: pieza.caras.map((cara: any) => ({
        cara: cara.codigo,
        estado: {
          condicion: cara.estado,
          movilidad: cara.movilidad,
          recesion: cara.recesion
        }
      })),
      diagnostico: pieza.diagnostico || '',
      procedimiento: pieza.procedimiento || '',
      movilidad: pieza.movilidad,
      recesion: pieza.recesion
    }));

    // PRIMERO: Crear la evolución
    const evolucionData = {
      motivo_consulta: 'Consulta odontológica',
      enfermedad_actual: 'Evaluación odontológica',
      antecedentes_personales: '',
      antecedentes_familiares: '',
      pacienteId: this.pacienteId,
      medicoId: this.medicoService.obtenerMedicoActualId(),
      signosVitalesId: this.signosVitales?.id ? Number(this.signosVitales.id) : null,
      fecha: new Date().toISOString(),
      medicamentos: [],
      diagnosticos: []
    };

    console.log('Creando evolución para dentista:', evolucionData);

    // Crear la evolución PRIMERO
    this.medicoService.crearEvolucion(evolucionData).subscribe({
      next: (evolucionResponse) => {
        console.log('Evolución creada:', evolucionResponse);
        
        // SEGUNDO: Crear el odontograma con el evolucionId correcto
        const datosOdontograma = {
          pacienteId: this.pacienteId,
          evolucionId: evolucionResponse.data.id, // ← USAR EL ID DE LA EVOLUCIÓN CREADA
          dentistaId: 0, // Se establecerá en el backend
          fecha: new Date(),
          observaciones: odontogramaComponent.odontogramaForm.value.observaciones || '',
          piezas: piezasParaBackend,
          indices: []
        };

        console.log('Guardando odontograma con evolucionId correcto:', datosOdontograma);

        // Crear el odontograma
        this.odontogramaService.crear(datosOdontograma).subscribe({
          next: (response) => {
            console.log('Odontograma creado:', response);
            this.success = 'Odontograma y evolución guardados exitosamente';
            this.loading = false;
            setTimeout(() => {
              this.router.navigate(['/doctor']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error al crear odontograma:', error);
            this.error = 'Error al guardar el odontograma';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al crear evolución:', error);
        this.error = 'Error al crear la evolución';
        this.loading = false;
      }
    });
  }

  // Guardar odontograma en la evolución
  private guardarOdontogramaEnEvolucion() {
    this.loading = true;

    // Obtener el odontograma actual del componente hijo
    const odontogramaComponent = this.odontogramaComponentRef;
    if (odontogramaComponent && typeof odontogramaComponent.guardarOdontograma === 'function') {
      // Llamar al método guardar del componente hijo
      odontogramaComponent.guardarOdontograma().subscribe({
        next: (odontograma: Odontograma) => {
          console.log('Odontograma guardado exitosamente:', odontograma);
          this.success = 'Evolución y odontograma guardados exitosamente';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/doctor']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Error al guardar odontograma:', error);
          this.error = 'Error al guardar el odontograma';
          this.loading = false;
        }
      });
    } else {
      console.log('El componente de odontograma no está disponible o no tiene el método guardarOdontograma');
      this.error = 'Error: componente de odontograma no disponible';
      this.loading = false;
    }
  }

  // Continuar con el flujo normal de evolución
  private continuarConEvolucion() {
    // Aquí va el código original del onSubmit para guardar la evolución
    console.log('Continuando con evolución normal...');
    // ... resto del código original
  }

  // Métodos helper para el template
  getPiezaCara(pieza: any): string {
    return pieza.cara || 'General';
  }

  getPiezaDiagnostico(pieza: any): string {
    if (typeof pieza.diagnostico === 'string') {
      return pieza.diagnostico;
    }
    if (pieza.diagnostico?.nombre) {
      return pieza.diagnostico.nombre;
    }
    return '';
  }

  getPiezaProcedimiento(pieza: any): string {
    if (typeof pieza.procedimiento === 'string') {
      return pieza.procedimiento;
    }
    if (pieza.procedimiento?.nombre) {
      return pieza.procedimiento.nombre;
    }
    return '';
  }

  hasPiezaDiagnostico(pieza: any): boolean {
    return !!(pieza.diagnostico || pieza.diagnostico?.nombre);
  }

  hasPiezaProcedimiento(pieza: any): boolean {
    return !!(pieza.procedimiento || pieza.procedimiento?.nombre);
  }

  getPiezaEstado(pieza: any): 'sano' | 'cariado' | 'ausente' | string {
    const condicion = pieza?.estado?.condicion;
    if (condicion === 'sano' || condicion === 'cariado' || condicion === 'ausente') {
      return condicion;
    }
    return condicion || 'sano';
  }

  // Limpiar estado del examen físico antes de cargar nuevos datos
  private limpiarEstadoExamenFisico(): void {
    if (this.examenFisicoRef) {
      console.log('Limpiando estado anterior del examen físico');
      // Resetear el componente de examen físico a un estado vacío
      this.examenFisicoRef.lesionesSeleccionadas = {};
      this.examenFisicoRef.parteActiva = null;
      this.examenFisicoRef.modoEdicion = false;
    }
  }

  // Método mejorado para cargar examen físico con retry y mejor manejo de errores
  private cargarExamenFisicoConRetry(retryCount: number = 0, maxRetries: number = 5): void {
    const maxDelay = 2000; // Máximo 2 segundos
    const delay = Math.min(100 * Math.pow(2, retryCount), maxDelay); // Exponential backoff

    setTimeout(() => {
      // Verificar condiciones previas
      if (!this.evolucionId) {
        console.warn('No hay evoluciónId disponible para cargar examen físico');
        return;
      }

      if (!this.examenFisicoRef) {
        if (retryCount < maxRetries) {
          console.log(`Componente de examen físico no listo, reintentando en ${delay}ms... (intento ${retryCount + 1}/${maxRetries + 1})`);
          this.cargarExamenFisicoConRetry(retryCount + 1, maxRetries);
        } else {
          console.error('Componente de examen físico no disponible después de varios intentos');
          this.error = 'Error: No se pudo inicializar el componente de examen físico';
        }
        return;
      }

      console.log(`Intentando cargar examen físico para evolución ${this.evolucionId} (intento ${retryCount + 1}/${maxRetries + 1})`);

      // Limpiar estado anterior antes de cargar nuevos datos
      this.limpiarEstadoExamenFisico();

      // Crear timeout para la petición
      const timeoutId = setTimeout(() => {
        console.warn('Timeout al cargar examen físico, cancelando petición');
        if (retryCount < maxRetries) {
          this.cargarExamenFisicoConRetry(retryCount + 1, maxRetries);
        } else {
          console.error('Timeout persistente al cargar examen físico');
          this.error = 'Error: Tiempo de espera agotado al cargar examen físico';
        }
      }, 10000); // 10 segundos timeout

      this.examenFisicoService.getByEvolucion(this.evolucionId).subscribe({
        next: (resp) => {
          clearTimeout(timeoutId); // Cancelar timeout
          console.log('Respuesta del examen físico:', resp);

          if (resp?.success && resp.data) {
            console.log('Cargando examen físico en el componente:', resp.data);
            try {
              this.examenFisicoRef.loadFromServer(resp.data);
              console.log('Examen físico cargado exitosamente');
            } catch (loadError) {
              console.error('Error al cargar datos en el componente:', loadError);
              this.error = 'Error al procesar los datos del examen físico';
            }
          } else if (resp?.success === false) {
            console.log('Servidor indica que no hay datos de examen físico - componente limpiado');
          } else {
            console.warn('Respuesta inesperada del servidor:', resp);
          }
        },
        error: (error) => {
          clearTimeout(timeoutId); // Cancelar timeout
          console.error(`Error al cargar examen físico (intento ${retryCount + 1}):`, error);

          // Analizar el tipo de error para decidir si reintentar
          const shouldRetry = this.analizarErrorParaRetry(error, retryCount, maxRetries);

          if (shouldRetry) {
            console.log(`Reintentando carga de examen físico en ${delay}ms...`);
            this.cargarExamenFisicoConRetry(retryCount + 1, maxRetries);
          } else {
            console.error('No se pudo cargar el examen físico después de varios intentos');
            // Solo mostrar error al usuario si es un error crítico
            if (error.status >= 500 || !error.status) {
              this.error = 'Error al cargar examen físico. Los datos pueden no estar completos.';
            }
          }
        }
      });
    }, delay);
  }

  // Método auxiliar para analizar errores y decidir si reintentar
  private analizarErrorParaRetry(error: any, retryCount: number, maxRetries: number): boolean {
    // No reintentar si ya se alcanzó el máximo
    if (retryCount >= maxRetries) {
      return false;
    }

    // Reintentar en errores de red o servidor temporal
    if (!error.status || error.status >= 500) {
      return true;
    }

    // No reintentar en errores del cliente (4xx)
    if (error.status >= 400 && error.status < 500) {
      console.warn(`Error del cliente ${error.status}, no se reintentará`);
      return false;
    }

    // Para otros casos, reintentar una vez más
    return retryCount < 2;
  }

}
