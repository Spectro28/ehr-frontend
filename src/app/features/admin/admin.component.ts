import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  newUser = {
    username: '',
    password: '',
    role: '',
    especialidad: '',
    cedula: '',
    email: '',
    empresa: '' // Aseguramos que este campo sea obligatorio
  };
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Listas para el dropdown
  especialidades: string[] = [
    'Cardiologia Adultos',
    'Cardiologia Pediatrica',
    'Angiologia',
    'Nefrologia',
    'Endocrinologia',
    'Medicina Interna',
    'Nutricion',
    'Geriatria'
  ];
  roles = ['doctor', 'secretaria', 'enfermera'];
  empresas: string[] = ['CARDIOVASC', 'INVITROMED', 'Empresa 3'];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Carga de usuarios
  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Usuarios recibidos del backend:', users); // Depuración
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = 'Error al cargar usuarios';
        this.isLoading = false;
      }
    });
  }

  // Crear un nuevo usuario
  createUser() {
    console.log('Datos enviados al backend:', this.newUser); // Confirmación previa
    if (!this.newUser.username || !this.newUser.password || !this.newUser.role || !this.newUser.empresa) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    if (!this.empresas.includes(this.newUser.empresa)) {
      this.errorMessage = 'Empresa no válida';
      return;
    }

    if (this.newUser.role === 'doctor' && !this.newUser.especialidad) {
      this.errorMessage = 'Por favor seleccione una especialidad para el doctor';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.createUser(this.newUser).subscribe({
      next: (response) => {
        this.successMessage = 'Usuario creado exitosamente';
        this.resetForm();
        this.loadUsers(); // Recargar usuarios después de crear
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.errorMessage = error.error?.message || 'Error al crear usuario';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  toggleUserStatus(user: any) {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (response) => {
        user.active = !user.active;
        this.successMessage = 'Estado del usuario ' + (user.active ? 'activado' : 'desactivado') + ' exitosamente';
      },
      error: (error) => {
        console.error('Error al actualizar estado del usuario:', error);
        this.errorMessage = 'Error al actualizar estado del usuario';
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'doctor':
        return 'bg-doctor';
      case 'secretaria':
        return 'bg-secretaria';
      case 'enfermera':
        return 'bg-enfermera';
      default:
        return 'bg-secondary';
    }
  }

  private resetForm() {
    this.newUser = {
      username: '',
      password: '',
      role: '',
      especialidad: '',
      cedula: '',
      email: '',
      empresa: '' // Restablecer empresa
    };
  }

  shouldShowEspecialidad(): boolean {
    return this.newUser.role === 'doctor';
  }
}
