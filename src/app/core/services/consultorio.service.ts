import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Horario {
  dia: string;
  fecha: string; // Agregamos la fecha
  horaInicio: string;
  horaFin: string;
}
export interface Consultorio {
  id?: number;
  numero: string;
  descripcion: string;
  doctorId: number;
  horarios: Horario[];
  doctor?: {
    id: number;
    username: string;
    especialidad: string;
  };
}

export interface Doctor {
  id: number;
  username: string;
  especialidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {
  private apiUrl = `${environment.apiUrl}/api/consultorios`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  getConsultorios(): Observable<Consultorio[]> {
    return this.http.get<Consultorio[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getDoctores(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  createConsultorio(consultorio: Omit<Consultorio, 'id'>): Observable<Consultorio> {
    return this.http.post<Consultorio>(this.apiUrl, consultorio, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }



  updateConsultorio(id: number, consultorio: Partial<Consultorio>): Observable<Consultorio> {
    if (!id) {
      return throwError(() => new Error('ID de consultorio inválido'));
    }
  
    const url = `${this.apiUrl}/${id}`;
    
    console.log('Datos enviados al servidor:', consultorio); // Debug
  
    return this.http.put<Consultorio>(
      url,
      consultorio,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error completo:', error);
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.status === 404) {
      errorMessage = 'No se encontró el consultorio';
    }
    
    return throwError(() => ({
      message: errorMessage,
      statusCode: error.status,
      error: error
    }));
  }

  deleteConsultorio(id: number): Observable<any> {
    if (!id) {
      return throwError(() => new Error('ID de consultorio inválido'));
    }
  
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(error => {
        console.error('Error al eliminar:', error);
        const errorMessage = error.error?.message || 'Error al eliminar el consultorio';
        return throwError(() => ({
          success: false,
          message: errorMessage
        }));
      })
    );
  }
  }


