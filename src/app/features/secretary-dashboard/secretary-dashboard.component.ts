import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { PatientsComponent } from '../patients/patients.component';
import { ConsultoriosComponent } from '../consultorios/consultorios.component';
import { CitasListComponent } from '../citas/citas-list/citas-list.component';

@Component({
  selector: 'app-secretary-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PatientsComponent, 
    ConsultoriosComponent,
    CitasListComponent
  ],
  templateUrl: './secretary-dashboard.component.html',
  styleUrls: ['./secretary-dashboard.component.css']
})
export class SecretaryDashboardComponent {
  activeTab = 'patients';

  constructor(private router: Router) {}

  setActiveTab(tab: string) {
    console.log('Cambiando a tab:', tab);
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  cerrarSesion() {
    // Limpiar el token y otros datos de sesión
    localStorage.removeItem('token');
    localStorage.clear();
    
    // Redirigir al login
    this.router.navigate(['/login']).then(() => {
      console.log('Sesión cerrada exitosamente');
    }).catch(error => {
      console.error('Error al redirigir:', error);
    });
  }
}