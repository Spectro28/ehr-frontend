import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <h1>🚫 Acceso No Autorizado</h1>
        <p>Lo sentimos, no tienes permisos para acceder a esta página.</p>
        <p *ngIf="userRole">Tu rol actual es: <strong>{{ userRole }}</strong></p>
        <div class="buttons">
          <button class="btn btn-primary" (click)="goToHome()">
            Ir a mi página principal
          </button>
          <button class="btn btn-secondary" (click)="logout()">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 90%;
    }

    h1 {
      color: #dc3545;
      margin-bottom: 1rem;
    }

    p {
      color: #6c757d;
      margin-bottom: 1.5rem;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }
  `]
})
export class UnauthorizedComponent {
  userRole: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  goToHome() {
    // Redirige según el rol del usuario
    switch (this.userRole) {
      case 'administrador':
        this.router.navigate(['/admin']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor']);
        break;
      case 'secretaria':
        this.router.navigate(['/secretaria']);
        break;
      case 'enfermera':
        this.router.navigate(['/enfermera']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}