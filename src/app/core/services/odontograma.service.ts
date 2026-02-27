import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { 
    Odontograma, 
    OdontogramaResponse, 
    OdontogramasResponse 
} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class OdontogramaService {
    private endpoint = 'odontograma';

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Crear nuevo odontograma
    crear(odontograma: Odontograma): Observable<Odontograma> {
        console.log('Enviando odontograma al backend:', odontograma);
        return this.apiService.post<Odontograma>(this.endpoint, odontograma)
            .pipe(
                map(response => {
                    console.log('Respuesta del backend (crear):', response);
                    return response;
                }),
                catchError(error => {
                    console.error('Error en servicio de odontograma (crear):', error);
                    return this.apiService.handleError(error);
                })
            );
    }

    // Obtener odontograma por ID
    obtenerPorId(id: number): Observable<Odontograma> {
        return this.apiService.get<any>(`${this.endpoint}/${id}`)
            .pipe(
                map(response => {
                    const data = response?.data ?? response;
                    if (!data) {
                        throw new Error(response?.message || 'Odontograma no encontrado');
                    }
                    return data as Odontograma;
                }),
                catchError(this.apiService.handleError)
            );
    }

    // Obtener odontogramas por evolución
    obtenerPorEvolucion(evolucionId: number): Observable<Odontograma | null> {
        return this.apiService.get<any>(`${this.endpoint}/evolucion/${evolucionId}`)
            .pipe(
                map(response => (response?.data ?? response) || null),
                catchError(error => {
                    if (error.status === 404) {
                        return of(null);
                    }
                    return this.apiService.handleError(error);
                })
            );
    }

    // Obtener odontogramas por paciente
    obtenerPorPaciente(pacienteId: number): Observable<Odontograma[]> {
        return this.apiService.get<any>(`${this.endpoint}/paciente/${pacienteId}`)
            .pipe(
                map(response => {
                    const data = response?.data ?? response;
                    if (!data) {
                        return [];
                    }
                    return data as Odontograma[];
                }),
                catchError(this.apiService.handleError)
            );
    }

    // Actualizar odontograma
    actualizar(id: number, odontograma: Partial<Odontograma>): Observable<Odontograma> {
        return this.apiService.put<Odontograma>(`${this.endpoint}/${id}`, odontograma)
            .pipe(
                map(response => {
                    console.log('Respuesta del backend (actualizar):', response);
                    return response;
                }),
                catchError(this.apiService.handleError)
            );
    }

    // Eliminar odontograma
    eliminar(id: number): Observable<void> {
        return this.apiService.delete<{ success: boolean, message: string }>(`${this.endpoint}/${id}`)
            .pipe(
                map(response => {
                    if (!response.success) {
                        throw new Error(response.message || 'Error al eliminar el odontograma');
                    }
                }),
                catchError(this.apiService.handleError)
            );
    }

    // Métodos para verificar permisos y estado del odontograma
    canEditOdontograma(): boolean {
        return this.authService.hasRole('dentista');
    }

    hasOdontograma(pacienteId: number): Observable<boolean> {
        return this.obtenerPorPaciente(pacienteId).pipe(
            map(odontogramas => odontogramas.length > 0)
        );
    }

    // Métodos de utilidad para validación y procesamiento de datos
    
    // Validar número de pieza dental
    validarNumeroPieza(numero: number): boolean {
        return numero >= 11 && numero <= 48;
    }

    // Formatear fecha para el odontograma
    formatearFecha(fecha: Date): string {
        return fecha.toISOString();
    }

    // Calcular índice CPOD
    calcularCPOD(piezas: any[]): number {
        let cariados = 0, perdidos = 0, obturados = 0;
        
        piezas.forEach(pieza => {
            switch(pieza.estado?.condicion) {
                case 'cariado':
                    cariados++;
                    break;
                case 'ausente':
                    perdidos++;
                    break;
                case 'obturado':
                    obturados++;
                    break;
            }
        });

        return cariados + perdidos + obturados;
    }

    // Obtener diagnósticos
    obtenerDiagnosticos(): Observable<any> {
        return this.apiService.get<any>(`${this.endpoint}/catalogos/diagnosticos`)
            .pipe(
                catchError(this.apiService.handleError)
            );
    }

    // Obtener procedimientos
    obtenerProcedimientos(): Observable<any> {
        return this.apiService.get<any>(`${this.endpoint}/catalogos/procedimientos`)
            .pipe(
                catchError(this.apiService.handleError)
            );
    }

    // Subir imagen del paladar
    subirImagenPaladar(odontogramaId: number, imagenBase64: string): Observable<any> {
        return this.apiService.post<any>(`${this.endpoint}/${odontogramaId}/imagen-paladar`, { imagen: imagenBase64 })
            .pipe(
                catchError(this.apiService.handleError)
            );
    }

    // Obtener imagen del paladar
    obtenerImagenPaladar(odontogramaId: number): Observable<any> {
        return this.apiService.get<any>(`${this.endpoint}/${odontogramaId}/imagen-paladar`)
            .pipe(
                catchError(this.apiService.handleError)
            );
    }
}
