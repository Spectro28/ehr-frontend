import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { PatientsComponent } from '../../patients/patients.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pacientes-medico',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pacientes-medico.component.html',
  styleUrls: ['./pacientes-medico.component.css']
})
export class PacientesMedicoComponent extends PatientsComponent {
  
  constructor(
    patientService: PatientService,
    private router: Router,
    private authService: AuthService
  ) {
    super(patientService);
  }

  crearEvolucion(pacienteId: number) {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('No autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // Usar la ruta correcta que coincide con tu configuración
    this.router.navigate(['/doctor/evolucion/new'], {
      queryParams: { pacienteId: pacienteId }
    });
  }
  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}