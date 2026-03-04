import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { tap, catchError } from 'rxjs/operators';
import { OdontogramaService } from '../../../../core/services/odontograma.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientService } from '../../../../core/services/patient.service';
import { Odontograma, PiezaDental } from '../../../../core/interfaces';
import { Patient } from '../../../../core/interfaces/patient.interface';

// Interfaces para el nuevo odontograma
interface CaraDental {
  nombre: string;
  codigo: string;
  seleccionada: boolean;
  estado: 'sano' | 'lesion' | 'ausente';
  movilidad: number;
  recesion: number;
}

interface PiezaSeleccionada {
  numeroPieza: number;
  caras: CaraDental[];
  movilidad: number;
  recesion: number;
}

interface Diagnostico {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
}

interface Procedimiento {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
}

@Component({
    selector: 'app-odontograma',
    templateUrl: './odontograma.component.html',
    styleUrls: ['./odontograma.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule
    ]
})
export class OdontogramaComponent implements OnInit, OnChanges {
  @Input() evolucionId?: number;
  @Input() pacienteId!: number;
  @Input() canEdit: boolean = false;
  @Input() odontogramaId?: number; // Nuevo input para el ID del odontograma
  @Input() soloTabla: boolean = false; // Mostrar solo la tabla de piezas seleccionadas
  @Output() odontogramaUpdated = new EventEmitter<number>();

  odontogramaForm: FormGroup;
  odontogramaActual: Odontograma | null = null;
  pacienteActual: Patient | null = null;
  cargando = false;
  modoLectura = false;

  // Nuevas propiedades para el odontograma
  esAdulto = true; // true = adulto, false = niño
  piezasSeleccionadas: PiezaSeleccionada[] = [];
  diagnosticos: Diagnostico[] = [];
  procedimientos: Procedimiento[] = [];

  // Modal
  mostrarModal = false;
  piezaModal: number = 0;
  caraModal: string = '';
  carasDisponibles: CaraDental[] = [];

  // Formulario del modal
  modalForm: FormGroup;

  // Imagen del paladar
  imagenPaladar: string | null = null;
  imagenSeleccionada: string | null = null; // Cambiado a string para base64
  nombreArchivoSeleccionado: string = '';
  subiendoImagen = false;
  mensajeImagen: string = '';

  // Propiedades para imagen del paladar
  cargandoImagen = false;

  // Piezas dentales adultas (11-18, 21-28, 31-38, 41-48)
  piezasAdultas = [
    // Cuadrante superior derecho (11-18)
    [11, 12, 13, 14, 15, 16, 17, 18],
    // Cuadrante superior izquierdo (21-28)
    [21, 22, 23, 24, 25, 26, 27, 28],
    // Cuadrante inferior izquierdo (31-38)
    [31, 32, 33, 34, 35, 36, 37, 38],
    // Cuadrante inferior derecho (41-48)
    [41, 42, 43, 44, 45, 46, 47, 48]
  ];

  // Piezas dentales infantiles (51-55, 61-65, 71-75, 81-85)
  piezasInfantiles = [
    // Cuadrante superior derecho (51-55)
    [51, 52, 53, 54, 55],
    // Cuadrante superior izquierdo (61-65)
    [61, 62, 63, 64, 65],
    // Cuadrante inferior izquierdo (71-75)
    [71, 72, 73, 74, 75],
    // Cuadrante inferior derecho (81-85)
    [81, 82, 83, 84, 85]
  ];

  constructor(
    private fb: FormBuilder,
    private odontogramaService: OdontogramaService,
    private patientService: PatientService,
    public authService: AuthService
  ) {
    this.odontogramaForm = this.fb.group({
      observaciones: ['']
    });

    this.modalForm = this.fb.group({
      estado: ['sano'],
      movilidad: [1],
      recesion: [1]
    });

    this.inicializarCaras();
  }

  ngOnInit(): void {
    this.modoLectura = !this.canEdit;
    if (this.pacienteId) {
      this.cargarPaciente();
    }
    if (this.odontogramaId) {
      this.cargarOdontogramaPorId();
    }
    // No cargamos catálogos de diagnóstico/procedimiento (campos eliminados en UI)
    // this.cargarCatalogos();
  }

  ngOnDestroy(): void {
    // Limpiar URLs de objetos para liberar memoria
    if (this.imagenPaladar && this.imagenPaladar.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagenPaladar);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['odontogramaId'] && changes['odontogramaId'].currentValue) {
      // Si el padre asigna un odontogramaId después, preferimos cargar por ID
      this.cargarOdontogramaPorId();
    }
    if (changes['pacienteId'] && changes['pacienteId'].currentValue) {
      // Si el padre asigna un pacienteId después, cargar la información del paciente
      this.cargarPaciente();
    }
    if (changes['canEdit'] && changes['canEdit'].currentValue !== undefined) {
      // Si cambia el modo de edición, recargar imagen si es necesario
      if (this.canEdit && this.odontogramaActual?.id) {
        // Agregar delay adicional para asegurar que todo esté listo
        setTimeout(() => this.cargarImagenPaladar(), 1000);
      }
    }
  }

  private inicializarCaras() {
    this.carasDisponibles = [
      { nombre: 'Mesial', codigo: 'M', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Distal', codigo: 'D', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Vestibular', codigo: 'V', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Palatina', codigo: 'P', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Lingual', codigo: 'L', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Oclusal', codigo: 'O', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 },
      { nombre: 'Incisal', codigo: 'I', seleccionada: false, estado: 'sano', movilidad: 1, recesion: 1 }
    ];
  }

  private cargarPaciente() {
    if (!this.pacienteId) return;
    console.log('cargarPaciente() called with pacienteId:', this.pacienteId);

    this.patientService.getPatient(this.pacienteId).subscribe({
      next: (response) => {
        this.pacienteActual = response.data;
        console.log('Paciente cargado:', this.pacienteActual);
        if (this.pacienteActual && this.pacienteActual.edad !== undefined) {
          console.log('Edad del paciente:', this.pacienteActual.edad);
          // Automatically determine odontograma type based on age
          this.esAdulto = this.pacienteActual.edad > 13;
          console.log(`Tipo de odontograma determinado automáticamente: ${this.esAdulto ? 'Adulto' : 'Infantil'} (edad: ${this.pacienteActual.edad})`);
        } else {
          console.warn('Paciente no encontrado o edad no disponible');
        }
      },
      error: (error) => {
        console.error('Error al cargar paciente:', error);
      }
    });
  }

  private cargarCatalogos() {
    // Cargar diagnósticos
    this.odontogramaService.obtenerDiagnosticos().subscribe({
      next: (response) => {
        console.log('Diagnósticos cargados:', response);
        this.diagnosticos = response.data || response || [];
        console.log('Diagnósticos asignados:', this.diagnosticos);
      },
      error: (error) => console.error('Error al cargar diagnósticos:', error)
    });

    // Cargar procedimientos
    this.odontogramaService.obtenerProcedimientos().subscribe({
      next: (response) => {
        console.log('Procedimientos cargados:', response);
        this.procedimientos = response.data || response || [];
        console.log('Procedimientos asignados:', this.procedimientos);
      },
      error: (error) => console.error('Error al cargar procedimientos:', error)
    });
  }

  private cargarOdontograma() {
    if (!this.evolucionId) return;

    this.cargando = true;
    this.odontogramaService.obtenerPorEvolucion(this.evolucionId)
      .subscribe({
        next: (odontograma) => {
          this.odontogramaActual = odontograma;
          if (odontograma) {
            this.odontogramaForm.patchValue({
              observaciones: odontograma.observaciones
            });
            // Validate and set the odontograma type based on patient age
            if (this.pacienteActual) {
              const expectedTipo = this.pacienteActual.edad <= 13 ? 'infantil' : 'adulto';
              if (odontograma.tipo !== expectedTipo) {
                console.warn(`Tipo de odontograma inconsistente. Esperado: ${expectedTipo}, Actual: ${odontograma.tipo}. Se usará el tipo correcto basado en la edad.`);
                // Override the type to match patient age
                odontograma.tipo = expectedTipo;
              }
            }
            console.log('Setting esAdulto from odontograma tipo in cargarOdontogramaPorId:', odontograma.tipo);
            this.esAdulto = odontograma.tipo !== 'infantil';
            console.log('esAdulto set to:', this.esAdulto);
            // Cargar piezas seleccionadas si existen
            if (odontograma.piezas) {
              this.piezasSeleccionadas = this.convertirPiezasDentales(odontograma.piezas);
            }
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar odontograma:', error);
          alert('Error al cargar el odontograma');
          this.cargando = false;
        }
      });
  }

  private cargarOdontogramaPorId() {
    if (!this.odontogramaId) return;

    this.cargando = true;
    this.odontogramaService.obtenerPorId(this.odontogramaId)
      .subscribe({
        next: (odontograma) => {
          this.odontogramaActual = odontograma;
          if (odontograma) {
            this.odontogramaForm.patchValue({
              observaciones: odontograma.observaciones
            });
            // Validate and set the odontograma type based on patient age
            if (this.pacienteActual) {
              const expectedTipo = this.pacienteActual.edad <= 13 ? 'infantil' : 'adulto';
              if (odontograma.tipo !== expectedTipo) {
                console.warn(`Tipo de odontograma inconsistente. Esperado: ${expectedTipo}, Actual: ${odontograma.tipo}. Se usará el tipo correcto basado en la edad.`);
                // Override the type to match patient age
                odontograma.tipo = expectedTipo;
              }
            }
            console.log('Setting esAdulto from odontograma tipo in cargarOdontograma:', odontograma.tipo);
            this.esAdulto = odontograma.tipo !== 'infantil';
            console.log('esAdulto set to:', this.esAdulto);
            // Cargar piezas seleccionadas si existen
            if (odontograma.piezas) {
              this.piezasSeleccionadas = this.convertirPiezasDentales(odontograma.piezas);
            }
          }
          this.cargando = false;
          // Cargar imagen del paladar después de que el odontograma esté cargado
          setTimeout(() => this.cargarImagenPaladar(), 100);
        },
        error: (error) => {
          console.error('Error al cargar odontograma por ID:', error);
          alert('Error al cargar el odontograma');
          this.cargando = false;
        }
      });
  }

  // Cambiar entre vista adulto y niño - DESHABILITADO: Ahora es automático basado en edad
  cambiarVista(esAdulto: boolean) {
    // El tipo de odontograma ahora se determina automáticamente basado en la edad del paciente
    alert('El tipo de odontograma se determina automáticamente basado en la edad del paciente y no puede ser cambiado manualmente.');
  }

  // Obtener las piezas actuales según la vista
  getPiezasActuales(): number[][] {
    return this.esAdulto ? this.piezasAdultas : this.piezasInfantiles;
  }

  // Métodos helper para determinar tipos de dientes
  isLowerTooth(pieza: number): boolean {
    return pieza >= 31 && pieza <= 48;
  }

  isIncisor(pieza: number): boolean {
    const incisors = [11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43];
    return incisors.includes(pieza);
  }

  // Abrir modal al hacer clic en una cara
  abrirModal(pieza: number, cara: string) {
    if (this.modoLectura) return;
    
    this.piezaModal = pieza;
    this.caraModal = cara;
    this.mostrarModal = true;
    
    // Resetear formulario del modal
    this.modalForm.patchValue({
      estado: 'sano',
      movilidad: 1,
      recesion: 1
    });
  }

  // Cerrar modal
  cerrarModal() {
    this.mostrarModal = false;
    this.piezaModal = 0;
    this.caraModal = '';
  }

  // Guardar selección del modal
  guardarSeleccion() {
    const formValue = this.modalForm.value;
    
    // Buscar si ya existe una entrada para esta pieza
    let piezaExistente = this.piezasSeleccionadas.find(p => p.numeroPieza === this.piezaModal);
    
    if (piezaExistente) {
      // Actualizar cara existente
      const caraExistente = piezaExistente.caras.find(c => c.codigo === this.caraModal);
      if (caraExistente) {
        caraExistente.estado = formValue.estado;
        caraExistente.movilidad = formValue.movilidad;
        caraExistente.recesion = formValue.recesion;
      } else {
        // Agregar nueva cara
        piezaExistente.caras.push({
          nombre: this.carasDisponibles.find(c => c.codigo === this.caraModal)?.nombre || '',
          codigo: this.caraModal,
          seleccionada: true,
          estado: formValue.estado,
          movilidad: formValue.movilidad,
          recesion: formValue.recesion
        });
      }
    } else {
      // Crear nueva pieza
      const nuevaPieza: PiezaSeleccionada = {
        numeroPieza: this.piezaModal,
        caras: [{
          nombre: this.carasDisponibles.find(c => c.codigo === this.caraModal)?.nombre || '',
          codigo: this.caraModal,
          seleccionada: true,
          estado: formValue.estado,
          movilidad: formValue.movilidad,
          recesion: formValue.recesion
        }],
        movilidad: formValue.movilidad,
        recesion: formValue.recesion
      };
      this.piezasSeleccionadas.push(nuevaPieza);
    }
    
    this.cerrarModal();
    
    // Temporalmente habilitado para debug con datos simplificados
    console.log('Pieza agregada a la tabla:', this.piezasSeleccionadas);
    this.guardarOdontogramaAutomatico();
  }

  // Guardar odontograma automáticamente
  private guardarOdontogramaAutomatico() {
    if (this.modoLectura || !this.pacienteId) return;

    // Convertir piezasSeleccionadas a la estructura esperada por el backend
    const piezasParaBackend = this.piezasSeleccionadas.map(pieza => ({
      numeroPieza: pieza.numeroPieza,
      caras: pieza.caras.map(cara => ({
        cara: cara.codigo,
        estado: {
          condicion: cara.estado,
          movilidad: cara.movilidad,
          recesion: cara.recesion
        }
      })),
      movilidad: pieza.movilidad,
      recesion: pieza.recesion
    }));

    const datos: any = {
      pacienteId: this.pacienteId,
      evolucionId: this.evolucionId, // No usar 0, usar el valor real o undefined
      observaciones: this.odontogramaForm.value.observaciones || '',
      piezas: piezasParaBackend,
      indices: []
    };

    console.log('Enviando datos simplificados al backend:', datos);

    const observable = this.odontogramaActual?.id
      ? this.odontogramaService.actualizar(this.odontogramaActual.id, datos)
      : this.odontogramaService.crear(datos);

    observable.subscribe({
      next: (odontograma) => {
        this.odontogramaActual = odontograma;
        if (odontograma.id) {
          this.odontogramaUpdated.emit(odontograma.id);
          console.log('Odontograma guardado exitosamente:', odontograma);
        }
      },
      error: (error) => {
        console.error('Error al guardar odontograma automáticamente:', error);
        console.error('Datos enviados:', datos);
        console.error('Error completo:', error);
        // Mostrar mensaje de error al usuario
        alert('Error al guardar el odontograma. Por favor, inténtalo de nuevo.');
      }
    });
  }

  // Eliminar pieza de la tabla
  eliminarPieza(index: number) {
    this.piezasSeleccionadas.splice(index, 1);
  }

  // Manejo de selects con opción "Otro"
  // Diagnóstico/procedimiento handlers removed (fields no longer used in UI)


  // Obtener caras seleccionadas como string
  getCarasSeleccionadas(pieza: PiezaSeleccionada): string {
    return pieza.caras.map(c => c.nombre).join(', ');
  }

  // Obtener estado de la pieza de forma segura
  getEstadoPieza(pieza: PiezaSeleccionada): string {
    const estado = pieza.caras[0]?.estado || 'sano';
    switch(estado) {
      case 'sano': return '✅ Sano';
      case 'lesion': return '❌ Lesión';
      case 'ausente': return '🚫 Ausente';
      default: return '✅ Sano';
    }
  }

  // Método para obtener el nombre completo de la cara dental
  getNombreCara(codigoCara: string): string {
    const carasMap: { [key: string]: string } = {
      'M': 'Mesial',
      'D': 'Distal',
      'V': 'Vestibular',
      'P': 'Palatina',
      'O': 'Oclusal',
      'L': 'Lingual',
      'I': 'Incisal'
    };
    return carasMap[codigoCara] || codigoCara || 'General';
  }

  // Obtener clase CSS del estado de forma segura
  getClaseEstado(pieza: PiezaSeleccionada): string {
    const estado = pieza.caras[0]?.estado || 'sano';
    return `estado-${estado}`;
  }

  // Convertir PiezaDental[] a PiezaSeleccionada[]
  private convertirPiezasDentales(piezas: PiezaDental[]): PiezaSeleccionada[] {
    // Agrupar piezas por numeroPieza
    const piezasAgrupadas: { [key: number]: any[] } = {};

    piezas.forEach((piezaBackend: any) => {
      const numeroPieza = piezaBackend.numeroPieza;
      if (!piezasAgrupadas[numeroPieza]) {
        piezasAgrupadas[numeroPieza] = [];
      }
      piezasAgrupadas[numeroPieza].push(piezaBackend);
    });

    // Convertir cada grupo en una PiezaSeleccionada
    return Object.keys(piezasAgrupadas).map(numeroPiezaStr => {
      const numeroPieza = Number(numeroPiezaStr);
      const piezasDelGrupo = piezasAgrupadas[numeroPieza];

  // Tomar primera pieza y estado; ignorar diagnóstico/procedimiento (se eliminaron del UI)
  const primeraPieza = piezasDelGrupo[0];
  const estadoBackend = primeraPieza.estado || {};

      // Mapear código de cara a nombre completo
      const getNombreCara = (codigo: string): string => {
        const carasMap: { [key: string]: string } = {
          'M': 'Mesial',
          'D': 'Distal',
          'V': 'Vestibular',
          'P': 'Palatina',
          'O': 'Oclusal',
          'L': 'Lingual',
          'I': 'Incisal'
        };
        return carasMap[codigo] || 'General';
      };

      // Crear array de caras para esta pieza
      const caras: CaraDental[] = piezasDelGrupo.map((piezaBackend: any) => {
        const estadoBackendCara = piezaBackend.estado || {};
        return {
          nombre: getNombreCara(piezaBackend.cara || 'G'),
          codigo: piezaBackend.cara || 'G',
          seleccionada: true,
          estado: estadoBackendCara.condicion === 'cariado' ? 'lesion' : (estadoBackendCara.condicion || 'sano'),
          movilidad: Number(estadoBackendCara.movilidad) || 1,
          recesion: Number(estadoBackendCara.recesion) || 1
        };
      });

      const piezaSel: PiezaSeleccionada = {
        numeroPieza: numeroPieza,
        caras: caras,
        movilidad: Number(estadoBackend.movilidad) || 1,
        recesion: Number(estadoBackend.recesion) || 1
      };

      return piezaSel;
    });
  }

  // Métodos para manejo de imagen del paladar
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea JPG
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        alert('Solo se permiten archivos JPG');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no puede superar los 5MB');
        return;
      }

      this.nombreArchivoSeleccionado = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenSeleccionada = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelarSeleccion() {
    this.imagenSeleccionada = null;
    this.nombreArchivoSeleccionado = '';
    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  subirImagen() {
    if (!this.imagenSeleccionada) {
      alert('Por favor selecciona una imagen primero');
      return;
    }

    // Si no hay odontograma creado, crearlo primero
    if (!this.odontogramaActual?.id) {
      if (this.piezasSeleccionadas.length === 0) {
        alert('Debe seleccionar al menos una pieza dental antes de subir la imagen');
        return;
      }

      // Crear odontograma primero
      this.guardarOdontograma()?.subscribe({
        next: () => {
          // Una vez creado el odontograma, subir la imagen
          this.subirImagenDespuesDeCrear();
        },
        error: (error) => {
          console.error('Error al crear odontograma:', error);
          alert('Error al crear el odontograma. Inténtalo de nuevo.');
        }
      });
    } else {
      // Odontograma ya existe, subir imagen directamente
      this.subirImagenDespuesDeCrear();
    }
  }

  private subirImagenDespuesDeCrear() {
    if (!this.imagenSeleccionada || !this.odontogramaActual?.id) {
      return;
    }

    this.subiendoImagen = true;
    this.mensajeImagen = '';

    this.odontogramaService.subirImagenPaladar(this.odontogramaActual.id, this.imagenSeleccionada)
      .subscribe({
        next: (response) => {
          console.log('Imagen subida correctamente:', response);
          this.mensajeImagen = 'Imagen subida correctamente';
          this.imagenSeleccionada = null;
          this.nombreArchivoSeleccionado = '';
          // Recargar el odontograma para obtener la imagen actualizada
          setTimeout(() => this.cargarImagenPaladar(), 500);
          this.subiendoImagen = false;
        },
        error: (error) => {
          console.error('Error al subir imagen:', error);
          this.mensajeImagen = 'Error al subir la imagen';
          this.subiendoImagen = false;
        }
      });
  }

  private cargarImagenPaladar() {
    if (!this.odontogramaActual?.id) {
      console.log('No hay odontograma ID para cargar imagen');
      this.imagenPaladar = null;
      return;
    }

    console.log('Cargando imagen del paladar para odontograma ID:', this.odontogramaActual.id);

    // Si ya hay una imagen seleccionada localmente, usarla directamente
    if (this.imagenSeleccionada) {
      console.log('Ya hay imagen seleccionada localmente, usándola directamente');
      this.imagenPaladar = this.imagenSeleccionada;
      return;
    }

    // Solo intentar cargar del servidor si estamos en modo edición
    if (!this.canEdit) {
      console.log('No se carga imagen porque no estamos en modo edición');
      this.imagenPaladar = null;
      return;
    }

    // Agregar un pequeño delay para asegurar que el odontograma esté completamente cargado
    setTimeout(() => {
      if (this.odontogramaActual?.id) {
        console.log('Intentando cargar imagen del servidor...');
        this.odontogramaService.obtenerImagenPaladar(this.odontogramaActual.id)
          .subscribe({
            next: (response) => {
              console.log('✅ Respuesta al cargar imagen:', response);
              if (response && response.imagen) {
                console.log('✅ Imagen encontrada en servidor, asignando URL');
                this.imagenPaladar = response.imagen;
              } else {
                console.log('⚠️ No se encontró imagen en la respuesta del servidor');
                this.imagenPaladar = null;
              }
            },
            error: (error) => {
              console.log('❌ Error al cargar imagen del servidor:', error);
              console.log('Status:', error?.status);
              console.log('Mensaje:', error?.message);
              // Solo loguear error si no es 404 (no encontrado)
              if (error?.status !== 404) {
                console.error('Error al cargar imagen del paladar:', error);
              } else {
                console.log('ℹ️ Imagen no encontrada (404), esto es normal si no hay imagen subida');
              }
              // En cualquier caso de error, asegurarse de que la URL sea null
              this.imagenPaladar = null;
            }
          });
      }
    }, 1000); // Aumentar delay a 1 segundo
  }

  // Guardar odontograma con imagen específicamente
  guardarOdontogramaConImagen() {
    if (!this.imagenSeleccionada) {
      alert('Por favor selecciona una imagen primero');
      return;
    }

    console.log('Iniciando guardado de odontograma con imagen...');
    this.cargando = true;

    // Llamar al método normal de guardar odontograma
    const observable = this.guardarOdontograma();
    if (observable) {
      observable.subscribe({
        next: () => {
          console.log('Odontograma con imagen guardado exitosamente');
          // Limpiar la selección después de guardar exitosamente
          this.imagenSeleccionada = null;
          this.nombreArchivoSeleccionado = '';
          this.mensajeImagen = 'Imagen guardada correctamente';
          this.cargando = false; // Asegurar que se resetee el estado
        },
        error: (error) => {
          console.error('Error al guardar odontograma con imagen:', error);
          this.mensajeImagen = 'Error al guardar la imagen';
          this.cargando = false; // Asegurar que se resetee el estado en error
        }
      });
    } else {
      console.error('No se pudo obtener el observable para guardar');
      this.cargando = false;
    }
  }

  // Guardar odontograma completo
  guardarOdontograma() {
    if (this.modoLectura) {
      alert('No tienes permisos para editar el odontograma');
      return;
    }

    if (!this.pacienteId) {
      alert('No se ha especificado un paciente');
      return;
    }

    // Solo guardar si hay piezas seleccionadas O si hay imagen seleccionada
    if (this.piezasSeleccionadas.length === 0 && !this.imagenSeleccionada) {
      alert('Debe seleccionar al menos una pieza dental o subir una imagen del paladar');
      return;
    }

    // Convertir piezasSeleccionadas a la estructura que el backend espera (sin diagnostico/procedimiento)
    const piezasParaBackend = this.piezasSeleccionadas.map((pieza: any) => ({
      numeroPieza: pieza.numeroPieza,
      caras: pieza.caras.map((cara: any) => ({
        cara: cara.codigo,
        estado: {
          condicion: cara.estado,
          movilidad: cara.movilidad,
          recesion: cara.recesion
        }
      })),
      movilidad: pieza.movilidad,
      recesion: pieza.recesion
    }));

    // Determine tipo automatically based on patient age
    const tipoAutomatico = this.pacienteActual && this.pacienteActual.edad <= 13 ? 'infantil' : 'adulto';

    const datos = {
      ...this.odontogramaForm.value,
      pacienteId: this.pacienteId,
      evolucionId: this.evolucionId,
      piezas: piezasParaBackend,
      fecha: new Date().toISOString(),
      tipo: tipoAutomatico,
      imagen_paladar: this.imagenSeleccionada || null // Agregar imagen del paladar si existe
    };

    this.cargando = true;

    const observable = this.odontogramaActual?.id
      ? this.odontogramaService.actualizar(this.odontogramaActual.id, datos)
      : this.odontogramaService.crear(datos);

    return observable.pipe(
      tap((odontograma) => {
        this.odontogramaActual = odontograma;

        if (odontograma.id) {
          this.odontogramaUpdated.emit(odontograma.id);
          this.odontogramaForm.patchValue({
            observaciones: odontograma.observaciones
          });

          if (odontograma.piezas) {
            this.piezasSeleccionadas = this.convertirPiezasDentales(odontograma.piezas);
          }

          // Si se guardó una imagen, actualizar la variable local
          if (this.imagenSeleccionada) {
            console.log('✅ Imagen guardada exitosamente, actualizando vista local');
            this.imagenPaladar = this.imagenSeleccionada;
            this.imagenSeleccionada = null; // Limpiar la selección
            this.nombreArchivoSeleccionado = '';
            this.mensajeImagen = 'Imagen subida correctamente';
            // No intentar recargar desde el servidor ya que ya tenemos la imagen localmente
            return;
          }
        }

        this.cargando = false;
        console.log('Odontograma guardado exitosamente:', odontograma);
      }),
      catchError((error) => {
        console.error('Error al guardar odontograma:', error);
        this.cargando = false;
        this.mensajeImagen = 'Error al guardar la imagen';
        throw error;
      })
    );
  }
}
