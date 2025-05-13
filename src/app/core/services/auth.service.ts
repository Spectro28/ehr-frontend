import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Interfaces para tipar las respuestas
interface User {
  id: number;
  username: string;
  role: string;
  active: boolean;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('Iniciando login para:', username);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/auth/login`, { 
      username, 
      password 
    }).pipe(
      tap(response => {
        console.log('Respuesta del login:', response);
        if (response.token) {
          this.setSession(response);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }
  

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Token actual:', token);
    return token;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  }

  isSecretary(): boolean {
    const user = this.getUser();
    return user?.role === 'SECRETARIA';
  }

  getUserRole(): string {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return '';
      
      const user = JSON.parse(userStr);
      return user.role || '';
    } catch (error) {
      console.error('Error al obtener el rol:', error);
      return '';
    }
  }

  hasRole(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    return userRole === requiredRole;
  }

  isUserActive(): boolean {
    const user = this.getUser();
    return user ? user.active : false;
  }

  forgotPassword(email: string): Observable<any> {
    console.log('Enviando solicitud de recuperación para:', { email });
    
    return this.http.post(`${this.apiUrl}/api/auth/forgot-password`, { 
      email 
    }).pipe(
      tap(response => {
        console.log('Respuesta de forgot password:', response);
      }),
      catchError(error => {
        console.error('Error en forgot password:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    console.log('Enviando reset password con token');
    
    return this.http.post(`${this.apiUrl}/api/auth/reset-password`, {
        token,
        newPassword  // Mantener como newPassword para coincidir con el backend
    }).pipe(
        tap(response => {
            console.log('Respuesta del servidor reset password:', response);
        }),
        catchError(error => {
            console.error('Error en reset password:', error);
            return throwError(() => error);
        })
    );
}

}