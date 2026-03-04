import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-role-switcher',
    imports: [],
    templateUrl: './role-switcher.component.html',
    styleUrls: ['./role-switcher.component.css']
})
export class RoleSwitcherComponent implements OnInit {
  availableRoles: string[] = [];
  showDropdown = false;
  currentRole: string = '';

  // Mapa para mostrar nombres legibles de roles
  roleNames: { [key: string]: string } = {
    'secretaria': 'Secretaria',
    'enfermera': 'Enfermera',
    'doctor': 'Doctor',
    'dentista': 'Dentista'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.availableRoles = this.authService.getAvailableRolesForSwitch();
    this.currentRole = this.authService.getActiveRole() || '';
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  switchRole(newRole: string): void {
    if (newRole !== this.currentRole) {
      this.authService.switchRole(newRole).subscribe({
        next: () => {
          this.showDropdown = false;
          // La redirección se maneja en el servicio
        },
        error: (error) => {
          console.error('Error al cambiar rol:', error);
          alert('Error al cambiar de rol. Inténtalo de nuevo.');
        }
      });
    }
  }

  getRoleDisplayName(role: string): string {
    return this.roleNames[role] || role;
  }

  getCurrentRoleDisplayName(): string {
    return this.getRoleDisplayName(this.currentRole);
  }
}