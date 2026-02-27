import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';

interface User {
  id?: number;
  username: string;
  password?: string;
  role: string;
  roles?: string[];
  especialidad?: string;
  active?: boolean;
  identificacion: string;
  tipo_identificacion: 'cedula' | 'pasaporte' | 'no_identificado';
  email: string;
  empresa: string;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateUserRequest {
  username: string;
  password: string;
  role: string; // El backend espera 'role' como string
  especialidad?: string;
  tipo_identificacion: 'cedula' | 'pasaporte' | 'no_identificado';
  identificacion?: string; // Hacer opcional para manejar 'no_identificado'
  email: string;
  empresa: string;
  // Propiedad opcional para compatibilidad con el frontend
  roles?: string[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  editingUser: any = null;
  selectedRoles: string[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  roles: string[] = ['administrador', 'doctor', 'dentista', 'secretaria', 'enfermera']; // Lista de roles disponibles para selección
  especialidades: string[] = [
  'Acupuntura',
  'Alergología',
  'Anatomía Patológica',
  'Anestesiología',
  'Atención Primaria en Salud',
  'Audiología / Foniatría',
  'Biología Molecular',
  'Bioquímica',
  'Cardiología',
  'Cirugía Cardíaca',
  'Cirugía Cardiotoráxica',
  'Cirugía Cardiovascular',
  'Cirugía de Cabeza y Cuello',
  'Cirugía General',
  'Cirugía Ortopédica Y Traumatología',
  'Cirugía Pediátrica',
  'Cirugía Plástica y Reconstructiva',
  'Cirugía Torácica',
  'Cirugía Vascular y Endovascular',
  'Dermatología',
  'Endocrinología',
  'Epidemiología, Medicina Tropical',
  'Especialista en Enfermedades Transmisibles y Epidemiología',
  'Fisiatría',
  'Gastroenterología',
  'Genética Clínica',
  'Genética Médica',
  'Gerencia en Administración Hospitalaria',
  'Geriatría y Gerontología',
  'Ginecología y Obstetricia',
  'Hematología',
  'Homeopatía',
  'Imagenología y Diagnóstico por imagen',
  'Infectología',
  'Inmunología',
  'Inmunología Clínica',
  'Laboratorio Clínico e Histopatológico',
  'Medicina Forense, Medicina Legal',
  'Medicina Aeroespacial',
  'Medicina Crítica',
  'Medicina De Emergencia',
  'Medicina Del Deporte',
  'Medicina Del Trabajo, Medicina Ocupacional',
  'Medicina Familiar Y Comunitaria',
  'Medicina General Integral',
  'Medicina Interna',
  'Medicina Nuclear',
  'Microbiología',
  'Nefrología',
  'Neumología',
  'Neurocirugía',
  'Neurofisiología Clínica',
  'Neurología',
  'Neuropsicología',
  'Neuropediatría',
  'Nutrición',
  'Nutrición Clínica',
  'Obstetricia',
  'Obstetricia Rural',
  'Odontología',
  'Odontologia Rural',
  'Oftalmología',
  'Oncología',
  'Otorrinolaringología',
  'Parasitología',
  'Patología Clínica',
  'Pediatría',
  'Proctología',
  'Psicología Clínica',
  'Psicorehabilitador',
  'Psiquiatría',
  'Psiquiatría Infantil y del Adolescente',
  'Reumatología',
  'Salud Pública',
  'Subespecialidad',
  'Terapia Neural',
  'Ultrasonido',
  'Urología',
  'Enfermería',
  'Auxiliar de Enfermería',
  'Enfermería Rural',
  'Medicina Rural',
  'Medicina General',
  'Vigilancia de la Salud',
  'Estimulación Temprana'
];
  
  empresas: string[] = ['CARDIOVASC', 'INVITROMED', 'Centro de Especialidades Médicas Prado Gómez', 'COIDHEX'];

  newUser: CreateUserRequest = {
    username: '',
    password: '',
    role: '',
    especialidad: '',
    tipo_identificacion: 'cedula',
    identificacion: '',
    email: '',
    empresa: ''
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response: any[]) => {
        this.users = (response || []).map((user: any) => {
          // Extraer los roles del usuario
          let roles: string[] = [];
          
          // Si el usuario tiene roles como array, extraer los nombres
          if (Array.isArray(user.roles) && user.roles.length > 0) {
            roles = user.roles.map((r: any) => {
              // Si el rol es un string, usarlo directamente, si es un objeto, usar la propiedad nombre
              return typeof r === 'string' ? r : (r.nombre || '');
            }).filter(Boolean); // Filtrar valores vacíos
          } 
          
          // Si no hay roles pero hay un role en la raíz, usarlo
          if (roles.length === 0 && user.role) {
            roles = [user.role];
          }
          
          // Si aún no hay roles, intentar obtenerlos de la propiedad 'Roles' (con mayúscula)
          if (roles.length === 0 && user.Roles && Array.isArray(user.Roles)) {
            roles = user.Roles.map((r: any) => r.nombre || '').filter(Boolean);
          }
          
          // Si después de todo no hay roles, establecer un valor por defecto
          if (roles.length === 0) {
            roles = ['sin_rol'];
          }
          
          // Crear el objeto de usuario con los datos formateados
          return {
            ...user,
            roles: roles,
            role: roles[0], // Asegurar que siempre haya un rol principal
            // Asegurarse de que las propiedades requeridas tengan un valor por defecto
            username: user.username || '',
            email: user.email || '',
            empresa: user.empresa || '',
            tipo_identificacion: user.tipo_identificacion || 'cedula',
            identificacion: user.identificacion || ''
          } as User;
        });
        
        console.log('Usuarios cargados:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = 'Error al cargar usuarios: ' + (error.error?.message || error.message || 'Error desconocido');
      }
    });
  }

  toggleRole(role: string) {
    this.newUser.role = role;
  }

  shouldShowEspecialidad(): boolean {
    // Mostrar especialidad solo si el usuario tiene el rol de doctor
    return this.selectedRoles.includes('doctor');
  }

  createUser() {
    // Validar que se haya seleccionado al menos un rol
    if (this.selectedRoles.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un rol';
      return;
    }

    // Validar que si el rol es doctor, se haya seleccionado una especialidad
    if (this.selectedRoles.includes('doctor') && !this.newUser.especialidad) {
      this.errorMessage = 'Debe seleccionar una especialidad para el rol de doctor';
      return;
    }

    // Crear el objeto de datos del usuario con el formato correcto
    const userData: any = {
      username: this.newUser.username,
      password: this.newUser.password,
      email: this.newUser.email,
      empresa: this.newUser.empresa,
      tipo_identificacion: this.newUser.tipo_identificacion,
      // Solo incluir identificacion si no es 'no_identificado' y tiene valor
      ...(this.newUser.tipo_identificacion !== 'no_identificado' && this.newUser.identificacion && {
        identificacion: this.newUser.identificacion
      }),
      // Incluir tanto el role principal como el array de roles
      role: this.selectedRoles[0], // El primer rol seleccionado será el principal
      roles: [...this.selectedRoles],
      // Solo incluir especialidad si el rol es doctor
      ...(this.selectedRoles.includes('doctor') && { especialidad: this.newUser.especialidad })
    };

    console.log('Enviando datos al servidor:', userData);

    this.isLoading = true;
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        console.log('Usuario creado:', response);
        this.successMessage = 'Usuario creado exitosamente';
        this.resetForm();
        // Forzar recarga inmediata de usuarios
        setTimeout(() => {
          this.loadUsers();
          this.isLoading = false;
        }, 500); // Pequeño retraso para asegurar que el backend haya procesado completamente la creación
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.errorMessage = 'Error al crear usuario: ' + (error.error?.message || error.message || 'Error desconocido');
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    // Clear previous error messages
    this.errorMessage = '';

    // Check all required fields
    const requiredFields = [
      { field: this.newUser.username, message: 'El nombre de usuario es requerido' },
      { field: this.newUser.password, message: 'La contraseña es requerida' },
      { field: this.newUser.email, message: 'El correo electrónico es requerido' },
      { field: this.newUser.empresa, message: 'La empresa es requerida' },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        this.errorMessage = message;
        return false;
      }
    }

    // Validar identificación si es requerida
    if (this.newUser.tipo_identificacion !== 'no_identificado' && !this.newUser.identificacion) {
      this.errorMessage = 'El número de identificación es requerido';
      return false;
    }

    // Check if at least one role is selected
    if (this.selectedRoles.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un rol';
      return false;
    }

    // If doctor role is selected, check for speciality
    if (this.selectedRoles.includes('doctor') && !this.newUser.especialidad) {
      this.errorMessage = 'Debe seleccionar una especialidad para el rol de doctor';
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.errorMessage = 'El formato del correo electrónico no es válido';
      return false;
    }

    return true;
  }

  private resetForm() {
    this.newUser = {
      username: '',
      password: '',
      role: '',
      especialidad: '',
      tipo_identificacion: 'cedula',
      identificacion: '',
      email: '',
      empresa: '',
      roles: []
    };
    this.selectedRoles = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleUserStatus(user: any) {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Actualizar el estado del usuario en la lista
          user.active = !user.active;
          this.successMessage = response.message || `Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`;
        } else {
          this.errorMessage = response.message || 'Error al cambiar estado del usuario';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al cambiar estado del usuario: ' + error.message;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'doctor': return 'bg-primary';
      case 'secretaria': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  editUser(user: any) {
    this.editingUser = { ...user };
    // Asegurarse de que los roles existentes se carguen correctamente
    this.selectedRoles = Array.isArray(user.roles) ? [...user.roles] : [];
    // Si es doctor, setear especialidad
    if (this.selectedRoles.includes('doctor')) {
      this.editingUser.especialidad = user.especialidad || '';
    } else {
      this.editingUser.especialidad = '';
    }
    console.log('Roles seleccionados:', this.selectedRoles);
  }

  // Método auxiliar para manejar el evento de cambio del checkbox
  handleCheckboxChange($event: Event, role: string) {
    const target = $event.target as HTMLInputElement;
    this.handleRoleChange(role, target.checked);
  }

  cancelEdit() {
    this.editingUser = null;
    this.selectedRoles = [];
  }

  handleRoleChange(role: string, checked: boolean) {
    if (checked) {
      // Si se está intentando marcar doctor y ya está dentista, o viceversa
      if ((role === 'doctor' && this.selectedRoles.includes('dentista')) ||
          (role === 'dentista' && this.selectedRoles.includes('doctor'))) {
        alert('No se puede asignar el rol de doctor y dentista al mismo tiempo');
        return;
      }
      
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles.push(role);
        // Si se marca doctor, inicializar especialidad si no existe
        if (role === 'doctor') {
          if (this.editingUser) {
            if (!this.editingUser.especialidad) {
              this.editingUser.especialidad = '';
            }
          } else if (!this.newUser.especialidad) {
            this.newUser.especialidad = '';
          }
        }
      }
    } else if (!checked) {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
      // Si se desmarca doctor, limpiar especialidad
      if (role === 'doctor') {
        if (this.editingUser) {
          this.editingUser.especialidad = '';
        } else {
          this.newUser.especialidad = '';
        }
      }
    }
    console.log('Roles actualizados:', this.selectedRoles);
  }
  saveUserChanges() {
    if (!this.editingUser) {
      return;
    }

    // Validar campos requeridos
    if (!this.editingUser.username || !this.editingUser.email) {
      this.errorMessage = 'El nombre de usuario y correo electrónico son requeridos';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editingUser.email)) {
      this.errorMessage = 'El formato del correo electrónico no es válido';
      return;
    }

    // Validar identificación si es requerida
    if (this.editingUser.tipo_identificacion !== 'no_identificado' && !this.editingUser.identificacion) {
      this.errorMessage = 'El número de identificación es requerido para el tipo de identificación seleccionado';
      return;
    }

    // Validar especialidad si es doctor
    if (this.selectedRoles.includes('doctor') && !this.editingUser.especialidad) {
      this.errorMessage = 'La especialidad es requerida para usuarios con rol de doctor';
      return;
    }

    const updateData = {
      username: this.editingUser.username,
      tipo_identificacion: this.editingUser.tipo_identificacion,
      identificacion: this.editingUser.identificacion,
      email: this.editingUser.email,
      especialidad: this.selectedRoles.includes('doctor') ? this.editingUser.especialidad : null
    };

    console.log('Enviando actualización:', updateData);
    this.isLoading = true;

    this.userService.updateUserBasicInfo(this.editingUser.id, updateData).subscribe({
      next: (response) => {
        console.log('Respuesta de actualización:', response);
        this.successMessage = 'Información del usuario actualizada exitosamente';
        
        // Actualizar el usuario en la lista local
        const userIndex = this.users.findIndex(u => u.id === this.editingUser.id);
        if (userIndex !== -1) {
          this.users[userIndex] = {
            ...this.users[userIndex],
            ...updateData
          };
        }
        
        // Recargar la lista completa para asegurar sincronización
        this.loadUsers();
        this.isLoading = false;
        this.cancelEdit();
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la información del usuario: ' + error.message;
        console.error('Error al actualizar usuario:', error);
        this.isLoading = false;
      }
    });
  }

  // Método para eliminar lógicamente un usuario (lo oculta de la lista)
  deleteUser(user: any) {
    const confirmMessage = `¿Está seguro de que desea eliminar al usuario ${user.username}?\n\n` +
      'Esta acción eliminará al usuario de la lista y no podrá iniciar sesión.\n' +
      'Nota: Solo se pueden eliminar usuarios que no tengan consultorios ni citas pendientes.';
    
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Usuario eliminado correctamente';
            // Remover el usuario de la lista visualmente
            this.users = this.users.filter(u => u.id !== user.id);
          } else {
            this.errorMessage = response.message || 'Error al eliminar el usuario';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al intentar eliminar el usuario';
          console.error('Error al eliminar usuario:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
