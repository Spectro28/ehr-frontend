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
    identificacion: '',
  password: '',
    selectedRole: ''
  };

  availableRoles: string[] = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera'];


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
  if (!this.formData.identificacion || !this.formData.password || !this.formData.selectedRole) {
    this.errorMessage = 'Por favor complete todos los campos y seleccione un rol';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.login(
    this.formData.identificacion,
    this.formData.password,
    this.formData.selectedRole
  ).subscribe({
    next: (response) => {
      if (!response.user.active) {
        this.errorMessage = 'Usuario desactivado. Contacte al administrador.';
        this.isLoading = false;
        return;
      }

      // Validar que el usuario tiene el rol seleccionado
      if (!response.user.roles.includes(this.formData.selectedRole)) {
        this.errorMessage = 'No tiene el rol seleccionado';
        this.isLoading = false;
        return;
      }

      this.authService.setActiveRole(this.formData.selectedRole);
      this.redirectBasedOnRole(this.formData.selectedRole);
    },
    error: (error) => {
      console.error('Error en login:', error);
      this.errorMessage = error.error?.message || 'Error en el inicio de sesión';
      this.isLoading = false;
    }
  });
}

selectRole() {
  if (!this.formData.selectedRole) {
    this.errorMessage = 'Por favor seleccione un rol';
    return;
  }

  this.authService.setActiveRole(this.formData.selectedRole);
  this.redirectBasedOnRole(this.formData.selectedRole);
}

private redirectBasedOnRole(role: string) {
  switch (role.toLowerCase()) {
    case 'administrador':
      this.router.navigate(['/admin']);
      break;
    case 'doctor':
    case 'dentista':
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
}
      
}