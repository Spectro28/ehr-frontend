import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reset-password-container">
  <form (ngSubmit)="onSubmit()" #resetForm="ngForm" class="reset-form">
    <h2 class="form-title">Restablecer Contraseña</h2>
    
    <div *ngIf="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div *ngIf="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <div class="form-group">
      <label for="password" class="form-label">Nueva Contraseña:</label>
      <input
        type="password"
        id="password"
        name="password"
        [(ngModel)]="password"
        required
        minlength="6"
        class="form-control"
        [disabled]="isLoading"
        placeholder="Ingresa tu nueva contraseña"
      >
    </div>

    <div class="form-group">
      <label for="confirmPassword" class="form-label">Confirmar Contraseña:</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        [(ngModel)]="confirmPassword"
        required
        class="form-control"
        [disabled]="isLoading"
        placeholder="Confirma tu nueva contraseña"
      >
    </div>

    <button 
      type="submit" 
      [disabled]="isLoading || !resetForm.form.valid || password !== confirmPassword" 
      class="btn btn-primary"
    >
      {{ isLoading ? 'Procesando...' : 'Restablecer Contraseña' }}
    </button>
  </form>
</div>

  `,
  styles: [`
    .reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
}

.reset-form {
  background: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 5px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

.alert-success {
  background-color: #d1e7dd;
  color: #0f5132;
  border: 1px solid #badbcc;
}

  `]
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Token no válido';
      }
    });
  }

  onSubmit() {
    if (!this.token) {
      this.errorMessage = 'Token no válido';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        this.successMessage = 'Contraseña actualizada exitosamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al restablecer la contraseña';
        this.isLoading = false;
      }
    });
  }
}