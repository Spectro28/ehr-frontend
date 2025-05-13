import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard - Verificando ruta:', state.url);

    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (!this.authService.isAuthenticated()) {
      console.log('Usuario no autenticado - Redirigiendo a login');
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.getUserRole();
    console.log('Rol del usuario:', userRole);

    const requiredRoles = route.data['roles'] as Array<string>;
    console.log('Roles requeridos:', requiredRoles);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(userRole)) {
        console.log(`Acceso denegado. Roles requeridos: ${requiredRoles}, Rol actual: ${userRole}`);
        this.router.navigate(['/unauthorized']);
        return false;
      } else {
        console.log('Acceso permitido - Rol coincide');
      }
    }

    console.log('Acceso permitido');
    return true;
  }
}