import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
interface User {
  id?: number;
  username: string;
  password?: string;
  role: string;
  especialidad?: string;
  active?: boolean;
  cedula: string;
  email: string;
  empresa: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  especialidad?: string;
  cedula: string;
  email: string;
  empresa: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

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
    console.log('Creando nuevo usuario:', userData);

    // Validaciones básicas
    if (!userData.username || !userData.password || !userData.role || 
        !userData.cedula || !userData.email || !userData.empresa) {
      return throwError(() => new Error('Todos los campos obligatorios deben estar completos'));
    }

  // Validar empresa
    const empresasValidas = ['CARDIOVASC', 'INVITROMED', 'Empresa 3'];
    if (!empresasValidas.includes(userData.empresa)) {
       return throwError(() => new Error('Empresa no válida'));
     }

    // Validar formato de cédula
    if (!/^[0-9]{10}$/.test(userData.cedula)) {
      return throwError(() => new Error('La cédula debe contener 10 dígitos numéricos'));
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return throwError(() => new Error('El formato del correo electrónico no es válido'));
    }

    return this.http.post<ApiResponse<User>>(
      `${this.apiUrl}/api/admin/users/create`,
      userData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('Usuario creado exitosamente:', response);
      }),
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
    if (!userData.cedula?.trim()) {
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