import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ExamenFisicoService, BodyPartItem, LesionCatalogItem, ExamenFisicoItemDTO, ExamenFisicoUpsertDTO } from '../../../core/services/examen-fisico.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-examen-fisico',
    imports: [FormsModule],
    templateUrl: './examen-fisico.component.html',
    styleUrls: ['./examen-fisico.component.scss']
})
export class ExamenFisicoComponent implements OnInit {
  @Input() evolucionId!: number;
  @Input() examenFisicoId?: number;
  @Input() canEdit = false; // se controla desde el padre por rol
  @Input() soloResumen: boolean = false;
  @Output() changed = new EventEmitter<void>();

  vista: 'anverso' | 'reverso' = 'anverso';
  partes: BodyPartItem[] = [];
  lesionesCatalogo: LesionCatalogItem[] = [];

  parteActiva: BodyPartItem | null = null;
  lesionesSeleccionadas: { [bodyPartId: string]: { lesiones: (number | { otro: string })[], observaciones?: string, bodyPartNombre: string, bodyPartId?: number } } = {};
  mostrarInputOtro: boolean = false;
  modoEdicion: boolean = false;

  // Datos para los SVGs - Posiciones para viewBox 0 0 203 443
  anversoPoints = [
    { cx: 134, cy: 280, r: 4, fill: 'red', dataPart: 'frente-genitales' },
    { cx: 134, cy: 30, r: 4, fill: 'red', dataPart: 'frente-cabeza' },
    { cx: 123, cy: 50, r: 3, fill: 'red', dataPart: 'frente-ojo-izquierdo' },
    { cx: 145, cy: 50, r: 3, fill: 'red', dataPart: 'frente-ojo-derecho' },
    { cx: 134, cy: 60, r: 3, fill: 'red', dataPart: 'frente-nariz' },
    { cx: 134, cy: 73, r: 3, fill: 'red', dataPart: 'frente-boca' },
    { cx: 134, cy: 100, r: 4, fill: 'red', dataPart: 'frente-cuello' }, 
    { cx: 75, cy: 120, r: 4, fill: 'red', dataPart: 'frente-hombro-izquierdo' },
    { cx: 192, cy: 120, r: 4, fill: 'red', dataPart: 'frente-hombro-derecho' },
    { cx: 134, cy: 140, r: 4, fill: 'red', dataPart: 'frente-pecho' },
    { cx: 70, cy: 170, r: 4, fill: 'red', dataPart: 'frente-brazo-izquierdo' },
    { cx: 195, cy: 170, r: 4, fill: 'red', dataPart: 'frente-brazo-derecho' },
    { cx: 65, cy: 210, r: 4, fill: 'red', dataPart: 'frente-codo-izquierdo' },
    { cx: 200, cy: 210, r: 4, fill: 'red', dataPart: 'frente-codo-derecho' },
    { cx: 55, cy: 245, r: 4, fill: 'red', dataPart: 'frente-antebrazo-izquierdo' },
    { cx: 210, cy: 245, r: 4, fill: 'red', dataPart: 'frente-antebrazo-derecho' },
    { cx: 50, cy: 300, r: 4, fill: 'red', dataPart: 'frente-mano-izquierda' },
    { cx: 220, cy: 300, r: 4, fill: 'red', dataPart: 'frente-mano-derecha' },
    { cx: 134, cy: 220, r: 4, fill: 'red', dataPart: 'frente-abdomen' },
    { cx: 134, cy: 255, r: 4, fill: 'red', dataPart: 'frente-cadera' },
    { cx: 107, cy: 320, r: 4, fill: 'red', dataPart: 'frente-muslo-izquierdo' },
    { cx: 163, cy: 320, r: 4, fill: 'red', dataPart: 'frente-muslo-derecho' },
    { cx: 107, cy: 380, r: 4, fill: 'red', dataPart: 'frente-rodilla-izquierda' },
    { cx: 163, cy: 380, r: 4, fill: 'red', dataPart: 'frente-rodilla-derecha' },
    { cx: 110, cy: 440, r: 4, fill: 'red', dataPart: 'frente-pantorrilla-izquierda' },
    { cx: 160, cy: 440, r: 4, fill: 'red', dataPart: 'frente-pantorrilla-derecha' },
    { cx: 115, cy: 490, r: 4, fill: 'red', dataPart: 'frente-tobillo-izquierdo' },
    { cx: 155, cy: 490, r: 4, fill: 'red', dataPart: 'frente-tobillo-derecho' },
    { cx: 105, cy: 510, r: 4, fill: 'red', dataPart: 'frente-pie-izquierdo' },
    { cx: 165, cy: 510, r: 4, fill: 'red', dataPart: 'frente-pie-derecho' }
  ];

  reversoPoints = [
    { cx: 100, cy: 290, r: 3, fill: 'red', dataPart: 'reverso-escroto' },
    { cx: 100, cy: 28, r: 4, fill: 'red', dataPart: 'reverso-cabeza' },
    { cx: 100, cy: 70, r: 3, fill: 'red', dataPart: 'reverso-occipital' },
    { cx: 100, cy: 90, r: 4, fill: 'red', dataPart: 'reverso-cuello' },
    { cx: 40, cy: 118, r: 4, fill: 'red', dataPart: 'reverso-hombro-izquierdo' },
    { cx: 160, cy: 118, r: 4, fill: 'red', dataPart: 'reverso-hombro-derecho' },
    { cx: 67, cy: 140, r: 4, fill: 'red', dataPart: 'reverso-omoplato-izquierdo' },
    { cx: 130, cy: 140, r: 4, fill: 'red', dataPart: 'reverso-omoplato-derecho' },
    { cx: 100, cy: 140, r: 3, fill: 'red', dataPart: 'reverso-columna-cervical' },
    { cx: 100, cy: 180, r: 3, fill: 'red', dataPart: 'reverso-columna-toracica' },
    { cx: 100, cy: 210, r: 3, fill: 'red', dataPart: 'reverso-columna-lumbar' },
    { cx: 40, cy: 160, r: 4, fill: 'red', dataPart: 'reverso-brazo-izquierdo' },
    { cx: 160, cy: 160, r: 4, fill: 'red', dataPart: 'reverso-brazo-derecho' },
    { cx: 30, cy: 205, r: 4, fill: 'red', dataPart: 'reverso-codo-izquierdo' },
    { cx: 170, cy: 205, r: 4, fill: 'red', dataPart: 'reverso-codo-derecho' },
    { cx: 22, cy: 240, r: 4, fill: 'red', dataPart: 'reverso-antebrazo-izquierdo' },
    { cx: 180, cy: 240, r: 4, fill: 'red', dataPart: 'reverso-antebrazo-derecho' },
    { cx: 20, cy: 280, r: 4, fill: 'red', dataPart: 'reverso-mano-izquierda' },
    { cx: 180, cy: 280, r: 4, fill: 'red', dataPart: 'reverso-mano-derecha' },
    { cx: 100, cy: 230, r: 4, fill: 'red', dataPart: 'reverso-espalda-baja' },
    { cx: 53, cy: 250, r: 4, fill: 'red', dataPart: 'reverso-cresta-iliaca-izquierda' },
    { cx: 145, cy: 250, r: 4, fill: 'red', dataPart: 'reverso-cresta-iliaca-derecha' },
    { cx: 100, cy: 250, r: 4, fill: 'red', dataPart: 'reverso-sacro' },
    { cx: 70, cy: 280, r: 4, fill: 'red', dataPart: 'reverso-gluteo-izquierdo' },
    { cx: 128, cy: 280, r: 4, fill: 'red', dataPart: 'reverso-gluteo-derecho' },
    { cx: 72, cy: 320, r: 4, fill: 'red', dataPart: 'reverso-muslo-izquierdo' },
    { cx: 125, cy: 320, r: 4, fill: 'red', dataPart: 'reverso-muslo-derecho' },
    { cx: 72, cy: 380, r: 4, fill: 'red', dataPart: 'reverso-rodilla-izquierda' },
    { cx: 125, cy: 380, r: 4, fill: 'red', dataPart: 'reverso-rodilla-derecha' },
    { cx: 72, cy: 440, r: 4, fill: 'red', dataPart: 'reverso-pantorrilla-izquierda' },
    { cx: 125, cy: 440, r: 4, fill: 'red', dataPart: 'reverso-pantorrilla-derecha' },
    { cx: 80, cy: 493, r: 4, fill: 'red', dataPart: 'reverso-talon-izquierdo' },
    { cx: 120, cy: 493, r: 4, fill: 'red', dataPart: 'reverso-talon-derecho' },
    { cx: 72, cy: 510, r: 4, fill: 'red', dataPart: 'reverso-pie-izquierdo' },
    { cx: 130, cy: 510, r: 4, fill: 'red', dataPart: 'reverso-pie-derecho' }
  ];

  constructor(private svc: ExamenFisicoService, private auth: AuthService) {}

  ngOnInit(): void {
    // Solo cargar catálogos y datos si no estamos en modo soloResumen o si hay datos
    if (!this.soloResumen || this.examenFisicoId) {
      this.svc.getCatalogos().subscribe({
        next: (resp) => {
          this.partes = resp.data.partes;
          this.lesionesCatalogo = resp.data.lesiones;
          
          console.log('Catálogo de lesiones cargado:', this.lesionesCatalogo);
          
          // Cargar datos existentes si hay evolucionId
          if (this.evolucionId) {
            this.cargarExamenFisicoExistente();
          }
        }
      });
    }
  }

  cargarExamenFisicoExistente(): void {
    if (!this.evolucionId) return;
    
    console.log('Cargando examen físico para evolución:', this.evolucionId);
    this.svc.getByEvolucion(this.evolucionId).subscribe({
      next: (resp) => {
        console.log('Respuesta del servidor:', resp);
        if (resp.data) {
          this.loadFromServer(resp.data);
        } else {
          console.log('No hay datos de examen físico para esta evolución');
        }
      },
      error: (err) => {
        console.error('Error al cargar examen físico:', err);
        // En modo soloResumen, no mostrar error si no hay datos
        if (this.soloResumen) {
          console.log('No hay examen físico para esta evolución (modo soloResumen)');
        }
      }
    });
  }

  onPointClick(point: any) {
    if (!this.canEdit) return;
    
    const partId = point.dataPart;
    if (partId) {
      // Buscar la parte correspondiente en el catálogo
      const parte = this.partes.find(p => String(p.id) === partId);
      if (parte) {
        this.modoEdicion = false; // Desactivar modo edición al seleccionar nueva parte
        this.abrirParte(parte);
        console.log('Parte seleccionada:', parte.nombre);
      }
    }
  }

  private highlightSelectedPoint(selectedPoint: HTMLElement) {
    // Remover highlight de todos los puntos
    const allPoints = document.querySelectorAll('.body-point');
    allPoints.forEach(point => {
      point.classList.remove('selected');
    });
    
    // Destacar el punto seleccionado
    selectedPoint.classList.add('selected');
  }

  get esDentistaBloqueado(): boolean {
    return !this.canEdit && this.auth.hasRole('dentista');
  }

  partesAnverso(): BodyPartItem[] { return this.partes.filter(p => p.vista === 'anverso'); }
  partesReverso(): BodyPartItem[] { return this.partes.filter(p => p.vista === 'reverso'); }

  abrirParte(p: BodyPartItem): void {
    if (!this.canEdit) return;
    this.parteActiva = p;
    this.mostrarInputOtro = false;
    const key = String(p.id || p.codigo);
    if (!this.lesionesSeleccionadas[key]) {
      this.lesionesSeleccionadas[key] = { lesiones: [], bodyPartNombre: p.nombre, bodyPartId: p.id };
    }
  }

  onLesionSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    console.log('Lesión seleccionada:', value, 'Parte activa:', this.parteActiva?.nombre);
    
    if (value === 'otro') {
      this.mostrarInputOtro = true;
    } else if (value && this.parteActiva) {
      this.agregarLesionSeleccion(parseInt(value));
      console.log('Lesión agregada, parte activa sigue siendo:', this.parteActiva?.nombre);
      // NO resetear el dropdown para mantener el panel abierto
      // target.value = ''; // Comentado para mantener el panel abierto
    }
  }

  agregarLesionOtro(texto: string): void {
    if (texto.trim() && this.parteActiva) {
      this.agregarLesionSeleccion(undefined, texto.trim());
    }
  }

  limpiarSeleccionLesion(selectElement: HTMLSelectElement): void {
    selectElement.value = '';
    this.mostrarInputOtro = false;
  }

  getParteKey(p?: BodyPartItem | null): string {
    const parte = p ?? this.parteActiva;
    if (!parte) return '';
    
    // En modo edición, usar el nombre de la parte para buscar en lesionesSeleccionadas
    if (this.modoEdicion && parte.nombre) {
      return parte.nombre;
    }
    
    return String(parte?.id ?? (parte as any)?.codigo ?? '');
  }

  getLesionesDeParteActiva(): (number | { otro: string })[] {
    const key = this.getParteKey();
    return this.lesionesSeleccionadas[key]?.lesiones ?? [];
  }

  getObservacionesActiva(): string {
    const key = this.getParteKey();
    return this.lesionesSeleccionadas[key]?.observaciones ?? '';
  }

  getLesionTexto(les: number | { otro: string } | any): string {
    console.log('Procesando lesión para texto:', les, 'Tipo:', typeof les);

    // Si es un número o un string que representa un número
    if (typeof les === 'number' || (typeof les === 'string' && !isNaN(Number(les)))) {
      const lesionId = typeof les === 'string' ? Number(les) : les;
      const n = this.lesionesCatalogo.find(x => x.id === lesionId)?.nombre;
      console.log('Lesión por ID:', lesionId, 'Nombre encontrado:', n);
      return n || ('#' + lesionId);
    }

    if (les && typeof les === 'object') {
      if (les.otro) {
        console.log('Lesión por otro:', les.otro);
        return 'Otro: ' + les.otro;
      }
      if (les.lesionTexto) {
        console.log('Lesión por lesionTexto:', les.lesionTexto);
        return 'Otro: ' + les.lesionTexto;
      }
      if (les.lesion && les.lesion.nombre) {
        console.log('Lesión por relación:', les.lesion.nombre);
        return les.lesion.nombre;
      }
      if (les.nombre) {
        console.log('Lesión por nombre directo:', les.nombre);
        return les.nombre;
      }
    }

    // Manejar casos edge: string vacío, null, undefined
    if (les === '' || les === null || les === undefined) {
      return 'Sin especificar';
    }

    console.log('Lesión no reconocida:', les);
    return 'Lesión desconocida';
  }

  setObservacionesActiva(texto: string): void {
    const key = this.getParteKey();
    console.log('Escribiendo observaciones:', texto, 'Para parte:', key, 'Parte activa:', this.parteActiva?.nombre);
    if (!key) return;
    this.setObservaciones(key, texto);
  }

  eliminarLesionActiva(index: number): void {
    const key = this.getParteKey();
    if (!key) return;
    this.eliminarLesion(key, index);
  }

  eliminarParteActiva(): void {
    const key = this.getParteKey();
    if (!key) return;
    this.eliminarParte(key);
  }

  getParteKeys(): string[] {
    // Solo mostrar partes que tengan al menos una lesión registrada Y observaciones
    return Object.keys(this.lesionesSeleccionadas).filter(key => {
      const parte = this.lesionesSeleccionadas[key];
      return parte && 
             parte.lesiones && 
             parte.lesiones.length > 0 && 
             parte.observaciones && 
             parte.observaciones.trim().length > 0;
    });
  }

  getAllParteKeys(): string[] {
    // Mostrar todas las partes que tengan datos (con o sin observaciones)
    return Object.keys(this.lesionesSeleccionadas).filter(key => {
      const parte = this.lesionesSeleccionadas[key];
      return parte && 
             parte.lesiones && 
             parte.lesiones.length > 0;
    });
  }

  // Obtener partes con registros incompletos (con lesiones pero sin observaciones)
  getPartesIncompletas(): string[] {
    return Object.keys(this.lesionesSeleccionadas).filter(key => {
      const parte = this.lesionesSeleccionadas[key];
      return parte && 
             parte.lesiones && 
             parte.lesiones.length > 0 && 
             (!parte.observaciones || parte.observaciones.trim().length === 0);
    });
  }

  getLesionesResumen(key: string): string {
    const arr = this.lesionesSeleccionadas[key]?.lesiones || [];
    return arr.map(l => this.getLesionTexto(l)).join(', ') || '—';
  }

  agregarLesionSeleccion(lesionId?: number, otro?: string): void {
    if (!this.parteActiva) return;
    const key = String(this.parteActiva.id || this.parteActiva.codigo);
    const entry = this.lesionesSeleccionadas[key];
    if (lesionId) {
      if (!entry.lesiones.includes(lesionId)) entry.lesiones.push(lesionId);
    } else if (otro && otro.trim()) {
      const otroTrimmed = otro.trim();
      // Verificar si ya existe una lesión "otro" con el mismo texto
      const existeOtro = entry.lesiones.some(l => typeof l === 'object' && l.otro === otroTrimmed);
      if (!existeOtro) {
        entry.lesiones.push({ otro: otroTrimmed });
      }
    }
    this.changed.emit();
  }

  eliminarLesion(parteKey: string, index: number): void {
    if (!this.canEdit) return;
    
    const parte = this.lesionesSeleccionadas[parteKey];
    if (parte) {
      parte.lesiones.splice(index, 1);
      
      // Si no hay lesiones y no hay observaciones, eliminar la parte del resumen
      if (parte.lesiones.length === 0 && (!parte.observaciones || parte.observaciones.trim() === '')) {
        delete this.lesionesSeleccionadas[parteKey];
      }
    }
    
    this.changed.emit();
  }

  eliminarParte(parteKey: string): void {
    if (!this.canEdit) return;
    delete this.lesionesSeleccionadas[parteKey];
    if (this.parteActiva && String(this.parteActiva.id || this.parteActiva.codigo) === parteKey) {
      this.parteActiva = null;
    }
    this.changed.emit();
  }

  setObservaciones(parteKey: string, texto: string): void {
    if (this.lesionesSeleccionadas[parteKey]) {
      this.lesionesSeleccionadas[parteKey].observaciones = texto;
      this.changed.emit();
    }
  }

  getPayload(): ExamenFisicoUpsertDTO {
    const items: ExamenFisicoItemDTO[] = Object.keys(this.lesionesSeleccionadas).map(key => {
      const entry = this.lesionesSeleccionadas[key];
      // Asegurar que bodyPartId sea un número
      const bodyPartId = typeof entry.bodyPartId === 'number' ? entry.bodyPartId : parseInt(key);
      
      console.log('Procesando item:', {
        key,
        entry,
        bodyPartId,
        bodyPartIdType: typeof bodyPartId
      });
      
      return {
        bodyPartId: undefined, // Always send undefined since we're using hardcoded catalog
        bodyPartNombre: entry.bodyPartNombre,
        observaciones: entry.observaciones,
        lesiones: entry.lesiones.map(l => typeof l === 'number' ? ({ lesionId: l }) : ({ lesionTexto: (l as any).otro?.trim() || null })).filter(les => les.lesionId != null || (les.lesionTexto != null && les.lesionTexto !== ''))
      };
    });
    
    const payload = { evolucionId: this.evolucionId, vistaInicial: this.vista, items };
    console.log('Payload completo:', payload);
    return payload;
  }

  // Rehidratar desde backend
  loadFromServer(examen: any): void {
    if (!examen) {
      console.log('No hay datos de examen físico');
      return;
    }
    
    console.log('Cargando datos del examen:', examen);
    this.vista = (examen.vistaInicial as any) || 'anverso';
    this.lesionesSeleccionadas = {};
    
    if (Array.isArray(examen.items)) {
      console.log('Procesando items:', examen.items);
      for (const item of examen.items) {
        const key = String(item.bodyPartId || item.bodyPartNombre);
        const lesiones: any[] = [];
        
        console.log('Procesando item:', item);
        
        if (Array.isArray(item.lesiones)) {
          console.log('Procesando lesiones:', item.lesiones);
          for (const les of item.lesiones) {
            console.log('Procesando lesión:', les);
            if (les.lesionId) {
              lesiones.push(les.lesionId);
              console.log('Agregada lesión por ID:', les.lesionId);
            } else if (les.lesionTexto) {
              lesiones.push({ otro: les.lesionTexto });
              console.log('Agregada lesión por texto:', les.lesionTexto);
            } else if (les.lesion && les.lesion.nombre) {
              lesiones.push({ otro: les.lesion.nombre });
              console.log('Agregada lesión por relación:', les.lesion.nombre);
            } else {
              console.log('Lesión no reconocida:', les);
            }
          }
        }
        
        this.lesionesSeleccionadas[key] = {
          bodyPartNombre: item.bodyPartNombre || item.bodyPart?.nombre || 'Parte desconocida',
          bodyPartId: item.bodyPartId,
          observaciones: item.observaciones || '',
          lesiones
        };
        
        console.log('Item procesado:', this.lesionesSeleccionadas[key]);
      }
    } else {
      console.log('No hay items en el examen');
    }
    
    console.log('Datos finales cargados:', this.lesionesSeleccionadas);
  }

  // Método para editar una parte desde el resumen
  editarParte(key: string): void {
    const parte = this.lesionesSeleccionadas[key];
    if (parte) {
      // Buscar la parte en el catálogo por nombre (ya que key es el nombre en el resumen)
      const parteCatalogo = this.partes.find(p => p.nombre === key);
      if (parteCatalogo) {
        this.parteActiva = parteCatalogo;
        this.modoEdicion = true; // Activar modo edición
        
        // Asegurar que la entrada existe en lesionesSeleccionadas con la clave correcta
        const correctKey = String(parteCatalogo.id || parteCatalogo.codigo);
        if (!this.lesionesSeleccionadas[correctKey]) {
          this.lesionesSeleccionadas[correctKey] = {
            lesiones: [...parte.lesiones],
            observaciones: parte.observaciones,
            bodyPartNombre: parte.bodyPartNombre,
            bodyPartId: parte.bodyPartId
          };
          // Eliminar la entrada con la clave incorrecta
          delete this.lesionesSeleccionadas[key];
        }
        
        // Solo marcar el punto si no estamos en modo soloResumen
        if (!this.soloResumen) {
          const pointElement = this.getPointElement(parteCatalogo.id);
          if (pointElement) {
            this.highlightSelectedPoint(pointElement);
          }
        }
      }
    }
  }

  // Método para eliminar una parte completa desde el resumen
  eliminarParteCompleta(key: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar todos los registros de esta parte del cuerpo?')) {
      delete this.lesionesSeleccionadas[key];
      // Si la parte activa es la que se está eliminando, limpiar la selección
      if (this.parteActiva && String(this.parteActiva.id) === key) {
        this.parteActiva = null;
      }
    }
  }

  // Método para salir del modo edición
  salirModoEdicion(): void {
    this.modoEdicion = false;
    this.parteActiva = null;
    // Remover highlight de todos los puntos
    const allPoints = document.querySelectorAll('.body-point');
    allPoints.forEach(point => {
      point.classList.remove('selected');
    });
  }

  // Método auxiliar para obtener el elemento del punto
  private getPointElement(parteId: number): HTMLElement | null {
    const allPoints = document.querySelectorAll('.body-point');
    for (let i = 0; i < allPoints.length; i++) {
      const point = allPoints[i];
      const dataPart = point.getAttribute('data-part');
      if (dataPart && dataPart.includes(String(parteId))) {
        return point as HTMLElement;
      }
    }
    return null;
  }

  // Método para esperar que el componente esté listo
  async waitForComponentReady(maxWaitTime: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkReady = () => {
        // Verificar si los catálogos están cargados y el componente está inicializado
        const isReady = this.partes.length > 0 && this.lesionesCatalogo.length > 0;

        if (isReady) {
          console.log('Componente examen-fisico está listo');
          resolve(true);
          return;
        }

        // Verificar tiempo límite
        if (Date.now() - startTime >= maxWaitTime) {
          console.warn('Tiempo límite alcanzado esperando que el componente examen-fisico esté listo');
          resolve(false);
          return;
        }

        // Reintentar después de un breve delay
        setTimeout(checkReady, 100);
      };

      checkReady();
    });
  }
}


