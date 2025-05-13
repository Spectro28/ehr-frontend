import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // Agregar AuthService
  ) { }

  getPacientesConSignos(): Observable<any> {
    const medicoId = this.authService.getUser()?.id;
    return this.http.get(`${this.apiUrl}/evoluciones/medico/${medicoId}/pacientes-con-signos`);
}

  obtenerDatosPaciente(pacienteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patients/${pacienteId}`).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
      }),
      catchError(error => {
        console.error('Error en obtenerDatosPaciente:', error);
        throw error;
      })
    );
  }

  crearEvolucion(evolucionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evoluciones`, evolucionData).pipe(
      tap(response => console.log('Evolución creada:', response)),
      catchError(error => {
        console.error('Error al crear evolución:', error);
        throw error;
      })
    );
  }

  actualizarEvolucion(evolucionId: number, evolucionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/evoluciones/${evolucionId}`, evolucionData).pipe(
      tap(response => console.log('Evolución actualizada:', response)),
      catchError(error => {
        console.error('Error al actualizar evolución:', error);
        throw error;
      })
    );
  }

  obtenerEvolucion(evolucionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evoluciones/${evolucionId}`).pipe(
      tap(response => console.log('Evolución obtenida:', response)),
      catchError(error => {
        console.error('Error al obtener evolución:', error);
        throw error;
      })
    );
  }

  obtenerMedicoActualId(): number {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData.id) {
        console.warn('No se encontró ID de médico en localStorage');
        return 0;
      }
      return userData.id;
    } catch (error) {
      console.error('Error al obtener ID del médico:', error);
      return 0;
    }
  }

  crearPrescripcion(evolucionId: number, prescripcionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/evolucion/${evolucionId}/prescripciones`, prescripcionData).pipe(
      tap(response => console.log('Prescripción creada:', response)),
      catchError(error => {
        console.error('Error al crear prescripción:', error);
        throw error;
      })
    );
  }
  
  obtenerPrescripciones(evolucionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evolucion/${evolucionId}/prescripciones`).pipe(
      tap(response => console.log('Prescripciones obtenidas:', response)),
      catchError(error => {
        console.error('Error al obtener prescripciones:', error);
        throw error;
      })
    );
  }
  
  actualizarPrescripcion(prescripcionId: number, prescripcionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/prescripciones/${prescripcionId}`, prescripcionData).pipe(
      tap(response => console.log('Prescripción actualizada:', response)),
      catchError(error => {
        console.error('Error al actualizar prescripción:', error);
        throw error;
      })
    );
  }
  
  eliminarPrescripcion(prescripcionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/prescripciones/${prescripcionId}`).pipe(
      tap(response => console.log('Prescripción eliminada:', response)),
      catchError(error => {
        console.error('Error al eliminar prescripción:', error);
        throw error;
      })
    );
  }

  getPacientesClasificados(): Observable<any> {
    const medicoId = this.authService.getUser()?.id;
    return this.http.get(`${this.apiUrl}/evoluciones/medico/${medicoId}/pacientes-clasificados`);
}

getPacientesOtrosMedicos(): Observable<any> {
  return this.http.get(`${this.apiUrl}/evoluciones/otros-medicos/pacientes`).pipe(
      tap(response => console.log('Pacientes de otros médicos:', response)),
      catchError(error => {
          console.error('Error:', error);
          return throwError(() => error);
      })
  );
}

getEvolucionesOtroMedico(pacienteId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/evoluciones/paciente/${pacienteId}/evoluciones-otros`).pipe(
      tap(response => console.log('Evoluciones de otro médico:', response)),
      catchError(error => {
          console.error('Error:', error);
          return throwError(() => error);
      })
  );
}
  
getEvolucionesPaciente(pacienteId: number): Observable<any> {
  const medicoId = this.authService.getUser()?.id;
  
  if (!medicoId) {
      return throwError(() => new Error('No se encontró ID del médico'));
  }

  return this.http.get<any>(`${this.apiUrl}/evoluciones/paciente/${pacienteId}/todas-evoluciones`).pipe(
      tap(response => {
          console.log('Respuesta completa del servidor:', response);
      }),
      catchError(error => {
          console.error('Error al obtener evoluciones:', error);
          return throwError(() => error);
      })
  );
}

// Método para verificar si el médico es el autor de la evolución
esMedicoAutor(evolucion: any): boolean {
  const medicoId = this.authService.getUser()?.id;
  return evolucion.medicoId === medicoId;
}
  
  eliminarEvolucion(evolucionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/evoluciones/${evolucionId}`).pipe(
      tap(response => console.log('Evolución eliminada:', response)),
      catchError(error => {
        console.error('Error al eliminar evolución:', error);
        throw error;
      })
    );
  }
  buscarCIE(termino: string): Observable<any> {
    const url = `${this.apiUrl}/evoluciones/cie/buscar?q=${termino}`;
    console.log('URL de búsqueda CIE:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error buscando CIE:', error);
        return throwError(() => error);
      })
    );
  }

  buscarMedicamentos(termino: string): Observable<any> {
    const url = `${this.apiUrl}/prescripciones/medicamentos/buscar`;
    const params = new HttpParams().set('q', termino);
    
    console.log('Buscando medicamentos:', url); // Para debugging
    
    return this.http.get(url, { params }).pipe(
        tap(response => console.log('Respuesta:', response)),
        catchError(error => {
            console.error('Error:', error);
            return throwError(() => error);
        })
    );
}

obtenerMedicamentoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/prescripciones/medicamentos/${id}`);
}
}

