import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule]
})
export class LoginComponent {
  formData = {
    username: '',
    password: '',
    selectedRole: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isTyping = false; // Para controlar si se está escribiendo
  showPassword = false; // Estado inicial del campo de contraseña


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

// Si hay texto en el input, muestra el ojo
  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isTyping = input.value.length > 0; 
  }
 // Función para alternar visibilidad de la contraseña
 togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}
  login() {
    // Validación de campos
    if (!this.formData.username || !this.formData.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(
      this.formData.username,
      this.formData.password
    ).subscribe({
      next: (response) => {
        if (!response.user.active) {
          this.errorMessage = 'Usuario desactivado. Contacte al administrador.';
          this.isLoading = false;
          return;
        }

        // Guardar datos en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        const userRole = response.user.role.toLowerCase();

        // Redirigir según el rol
        switch (response.user.role) {
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
            this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = error.error?.message || 'Error en el inicio de sesión';
        this.isLoading = false;
      }
    });
  }
}