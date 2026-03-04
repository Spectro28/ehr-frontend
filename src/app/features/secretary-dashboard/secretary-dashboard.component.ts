import { Component } from '@angular/core';

import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { PatientsComponent } from '../patients/patients.component';
import { ConsultoriosComponent } from '../consultorios/consultorios.component';
import { CitasListComponent } from '../citas/citas-list/citas-list.component';
import { PatientService } from '../../core/services/patient.service';
import { RoleSwitcherComponent } from '../../shared/components/role-switcher/role-switcher.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-secretary-dashboard',
    imports: [
    RouterModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PatientsComponent,
    ConsultoriosComponent,
    CitasListComponent,
    RoleSwitcherComponent
],
    templateUrl: './secretary-dashboard.component.html',
    styleUrls: ['./secretary-dashboard.component.css']
})
export class SecretaryDashboardComponent {
  activeTab = 'patients';

  pacientesSinIdentificacion: any[] = [];
  mostrarAlertas: boolean[] = [];
  userNameWithPrefix: string = '';

  constructor(private router: Router, private patientService: PatientService, private authService: AuthService) {}
  
  ngOnInit() {
    this.userNameWithPrefix = this.authService.getUserDisplayName();
    this.checkPacientesSinIdentificacion();
  }

checkPacientesSinIdentificacion() {
  this.patientService.getPacientesSinIdentificacion().subscribe({
    next: (data) => {
      this.pacientesSinIdentificacion = data.patients;
      this.mostrarAlertas = data.patients.map(() => true);
    },
    error: (error) => {
      console.error('Error al obtener pacientes sin identificación:', error);
    }
  });
}

  irAEditarPaciente(paciente: any) {
    this.router.navigate(['/patients', paciente.id, 'edit']);
  }

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