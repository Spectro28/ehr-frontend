import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { User, CreateUserRequest, ApiResponse } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No se encontró token de autenticación');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error en el servidor';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.message || errorMessage;
    }
    
    console.error('Error en UserService:', error);
    return throwError(() => new Error(errorMessage));
  }

  getUsers(): Observable<User[]> {
    console.log('Obteniendo usuarios...');
    
    return this.http.get<ApiResponse<User[]>>(
      `${this.apiUrl}/api/admin/users`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      map(response => {
        if (response.data) {
          return response.data;
        }
        throw new Error('No se recibieron datos de usuarios');
      }),
      catchError(this.handleError),
      tap(users => console.log('Usuarios procesados:', users))
    );
  }

  createUser(userData: CreateUserRequest): Observable<ApiResponse<User>> {
    console.log('Datos del usuario a crear:', userData);

    // Validaciones básicas
    if (!userData.username || !userData.password || !userData.email || !userData.empresa || 
        (userData.tipo_identificacion !== 'no_identificado' && !userData.identificacion)) {
      return throwError(() => new Error('Todos los campos obligatorios deben estar completos'));
    }

    // Validar que hay al menos un rol seleccionado
    if (!userData.roles || userData.roles.length === 0) {
      return throwError(() => new Error('Debe seleccionar al menos un rol'));
    }

    // Validar empresa
    const empresasValidas = ['CARDIOVASC', 'INVITROMED', 'Centro de Especialidades Médicas Prado Gómez', 'COIDHEX'];
    if (!empresasValidas.includes(userData.empresa)) {
      return throwError(() => new Error('Empresa no válida'));
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return throwError(() => new Error('El formato del correo electrónico no es válido'));
    }

    // Preparar datos para el backend
    const userDataToSend = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      empresa: userData.empresa,
      tipo_identificacion: userData.tipo_identificacion,
      identificacion: userData.identificacion,
      roles: userData.roles, // Enviar el array completo de roles
      // Solo incluir especialidad si el rol es doctor
      ...(userData.roles.includes('doctor') && { especialidad: userData.especialidad })
    };

    console.log('Enviando datos al servidor:', userDataToSend);

    // Crear usuario con todos los roles directamente
    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/api/admin/users/create`,
      userDataToSend,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(this.handleError)
    );
  }

  toggleUserStatus(userId: number): Observable<ApiResponse<User>> {
    if (!userId) {
      return throwError(() => new Error('Se requiere un ID de usuario válido'));
    }

    return this.http.patch<ApiResponse<User>>(
      `${this.apiUrl}/api/admin/users/${userId}/toggle-status`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log(`Estado del usuario ${userId} actualizado:`, response);
      }),
      catchError(this.handleError)
    );
  }

  updateUserBasicInfo(userId: number, userData: {
    username: string;
    tipo_identificacion: string;
    identificacion?: string;
    email: string;
    especialidad?: string | null;
  }): Observable<any> {
    console.log('Actualizando usuario:', { userId, userData });
    return this.http.put(
      `${this.apiUrl}/api/users/${userId}/basic-info`,
      userData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('Respuesta de actualización:', response);
      }),
      catchError(this.handleError)
    );
  }

  // Método para eliminar lógicamente un usuario
  deleteUser(userId: number): Observable<ApiResponse<any>> {
    if (!userId) {
      return throwError(() => new Error('Se requiere un ID de usuario válido'));
    }

    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/api/admin/users/${userId}`,
      { 
        headers: this.getHeaders()
      }
    ).pipe(
      tap(response => {
        console.log(`Usuario ${userId} desactivado lógicamente:`, response);
      }),
      catchError(error => {
        console.error('Error en deleteUser:', error);
        
        // Manejar errores específicos del backend
        if (error.status === 400) {
          const errorData = error.error;
          if (errorData.hasConsultorios || errorData.hasCitasPendientes) {
            let message = 'No se puede desactivar el usuario porque tiene registros asociados:\n';
            if (errorData.hasConsultorios) {
              message += `- Tiene ${errorData.consultoriosCount || 0} consultorio(s) asignado(s)\n`;
            }
            if (errorData.hasCitasPendientes) {
              message += `- Tiene ${errorData.citasPendientesCount || 0} cita(s) pendiente(s) o confirmada(s)\n`;
            }
            return throwError(() => new Error(message));
          }
          return throwError(() => new Error(errorData.message || 'Error al desactivar el usuario'));
        }
        
        if (error.status === 404) {
          return throwError(() => new Error('Usuario no encontrado'));
        }
        
        return this.handleError(error);
      })
    );
  }

  // Método auxiliar para validar datos del usuario
  private validateUserData(userData: CreateUserRequest): string | null {
    if (!userData.empresa?.trim()){
      return 'La empresa es requerida'
    }
    if (!userData.username?.trim()) {
      return 'El nombre de usuario es requerido';
    }
    if (!userData.password?.trim()) {
      return 'La contraseña es requerida';
    }
    if (!userData.role?.trim()) {
      return 'El rol es requerido';
    }
    if (!userData.identificacion?.trim()) {
      return 'La cédula es requerida';
    }
    if (!userData.email?.trim()) {
      return 'El correo electrónico es requerido';
    }
    if (userData.role === 'doctor' && !userData.especialidad?.trim()) {
      return 'La especialidad es requerida para usuarios doctores';
    }
    return null;
  }
}