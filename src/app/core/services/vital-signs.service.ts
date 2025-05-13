import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VitalSignsService {
    private apiUrl = `${environment.apiUrl}/api/vital-signs`;
    private citasUrl = `${environment.apiUrl}/api/citas`;
    private pacientesUrl = `${environment.apiUrl}/api/patients`;

    constructor(private http: HttpClient) {}

    create(vitalSigns: any): Observable<any> {
        console.log('Enviando datos:', vitalSigns);
        return this.http.post(this.apiUrl, vitalSigns).pipe(
            tap(response => console.log('Respuesta:', response)),
            catchError(this.handleError('Error al crear signos vitales'))
        );
    }

    update(id: number, vitalSigns: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, vitalSigns).pipe(
            catchError(this.handleError('Error al actualizar signos vitales'))
        );
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError('Error al eliminar signos vitales'))
        );
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError('Error al obtener signos vitales'))
        );
    }

    getPendingAppointments(): Observable<any> {
        return this.http.get(`${this.citasUrl}/sin-signos-vitales`).pipe(
            tap(response => console.log('Respuesta citas pendientes:', response)),
            map((response: any) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error('Formato de respuesta inválido');
            }),
            catchError(this.handleError('Error al cargar las citas pendientes'))
        );
    }

    getPacienteDetails(pacienteId: number): Observable<any> {
      return this.http.get(`${this.pacientesUrl}/${pacienteId}`).pipe(
          tap(response => {
              console.log('Respuesta original del paciente:', response);
          }),
          map((response: any) => {
              // La respuesta ya viene con la estructura correcta, la retornamos directamente
              return response;
          }),
          catchError(this.handleError('Error al obtener detalles del paciente'))
      );
  }

  getCitaDetails(citaId: number): Observable<any> {
    return this.http.get(`${this.citasUrl}/${citaId}`).pipe(
        tap(response => console.log('Respuesta original:', response)),
        map((response: any) => {
            if (response?.data) {
                // Si la respuesta incluye datos del paciente, formatearlos
                if (response.data.paciente) {
                    response.data.paciente = {
                        id: response.data.paciente.id,
                        nombres: response.data.paciente.firstName,
                        apellidos: response.data.paciente.lastName,
                        cedula: response.data.paciente.identification
                    };
                }
                return response.data;
            }
            throw new Error('Formato de respuesta inválido');
        }),
        tap(cita => console.log('Detalles de cita procesados:', cita)),
        catchError(this.handleError('Error al obtener detalles de la cita'))
    );
}

getCompletedVitalSigns(filters?: any): Observable<any> {
  console.log('Solicitando registros completados con filtros:', filters);
  let params = new HttpParams();
  
  if (filters) {
      if (filters.fecha) {
          params = params.set('fecha', filters.fecha);
      }
      if (filters.searchTerm) {
          params = params.set('searchTerm', filters.searchTerm);
      }
  }

  return this.http.get(`${this.apiUrl}/records/completed`, { params }).pipe(
      tap(response => console.log('Respuesta registros completados:', response)),
      map((response: any) => {
          if (response?.success && Array.isArray(response.data)) {
              // Filtrar los resultados localmente si es necesario
              let filteredData = response.data;
              
              if (filters?.searchTerm) {
                  const searchTerm = filters.searchTerm.toLowerCase();
                  filteredData = filteredData.filter((record: any) => {
                      const nombreCompleto = `${record.paciente?.primer_nombre} ${record.paciente?.apellido_paterno}`.toLowerCase();
                      const cedula = record.paciente?.cedula?.toLowerCase();
                      return nombreCompleto.includes(searchTerm) || cedula?.includes(searchTerm);
                  });
              }
              
              if (filters?.fecha) {
                  filteredData = filteredData.filter((record: any) => {
                      const recordDate = new Date(record.fecha_medicion).toISOString().split('T')[0];
                      return recordDate === filters.fecha;
                  });
              }
              
              return filteredData;
          }
          throw new Error('Formato de respuesta inválido');
      }),
      catchError(this.handleError('Error al obtener registros completados'))
  );
}

    private handleError(message: string) {
        return (error: any): Observable<never> => {
            console.error(message, error);
            return throwError(() => new Error(message));
        };
    }
}