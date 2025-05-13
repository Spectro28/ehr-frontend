import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No interceptar las peticiones de login
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  console.log('Interceptando request a:', req.url);
  console.log('Token presente:', !!token);

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next(clonedReq).pipe(
      catchError(error => {
        console.error('Error en request:', error);
        if (error.status === 401 || error.status === 403) {
          console.log('Error de autenticación, redirigiendo a login');
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};