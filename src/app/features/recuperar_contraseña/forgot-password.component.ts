import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  template: `
    <div class="forgot-password-container">
  <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" class="forgot-form">
    <h2 class="form-title">Recuperar Contraseña</h2>
    
    <div *ngIf="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div *ngIf="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <div class="form-group">
      <label for="email" class="form-label">Correo Electrónico:</label>
      <input
        type="email"
        id="email"
        name="email"
        [(ngModel)]="email"
        required
        email
        class="form-control"
        [disabled]="isLoading"
        placeholder="Ingresa tu correo electrónico"
      >
    </div>

    <button 
      type="submit" 
      [disabled]="isLoading || !forgotForm.form.valid" 
      class="btn btn-primary"
    >
      {{ isLoading ? 'Enviando...' : 'Recuperar Contraseña' }}
    </button>

    <div class="text-center mt-3">
      <a [routerLink]="['/login']" class="back-link">
        ← Volver al inicio de sesión
      </a>
    </div>
  </form>
</div>

  `,
  styles: [`
    .forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
}

.forgot-form {
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
  margin-bottom: 1rem;
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

.back-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-top: 0.5rem;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

  `]
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: RouterModule
  ) {}

  onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Por favor ingrese su correo electrónico';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.successMessage = 'Se ha enviado un correo con las instrucciones para recuperar su contraseña';
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al procesar la solicitud';
        this.isLoading = false;
      }
    });
  }
}