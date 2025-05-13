import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminComponent } from './features/admin/admin.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PatientsComponent } from './features/patients/patients.component';
import { ConsultoriosComponent } from './features/consultorios/consultorios.component';
import { ReportsComponent } from './features/reports/reports.component';
import { UnauthorizedComponent } from './features/NoAutorizado/unauthorized.component';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ForgotPasswordComponent } from './features/recuperar_contraseña/forgot-password.component';
import { ResetPasswordComponent } from './features/recuperar_contraseña/reset-password.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { SecretaryDashboardComponent } from './features/secretary-dashboard/secretary-dashboard.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { CitasListComponent } from './features/citas/citas-list/citas-list.component';
import { CitaFormComponent } from './features/citas/cita-form/cita-form.component';
import { CitasDetailComponent } from './features/citas/cita-detail/cita-detail.component';
import { VitalSignsListComponent } from './features/enfermera-dashboard/vital-signs-list/vital-signs-list.component';
import { VitalSignsFormComponent } from './features/enfermera-dashboard/vital-signs-form/vital-signs-form.component';
import { EnfermeraDashboardComponent } from './features/enfermera-dashboard/enfermera-dashboard.component';
import { EvolucionMedicaComponent } from './features/medico-dashboard/evolucion-medica/evolucion-medica.component';
import { MedicoDashboardComponent } from './features/medico-dashboard/medico-dashboard.component';
import { EvolucionesPacienteComponent } from './features/medico-dashboard/evoluciones-paciente/evoluciones-paciente.component';
import { PacientesMedicoComponent } from './features/medico-dashboard/pacientes-medico/pacientes-medico.component';


export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: 'patients',
    component: PatientsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['administrador', 'doctor', 'secretaria'] } 
  },
  {
    path: 'patients/new',
    component: PatientFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['administrador','doctor', 'secretaria'] }
  },
  {
    path: 'patients/:id/edit',
    component: PatientFormComponent,
    canActivate: [AuthGuard],
    data: { roles: ['administrador','doctor', 'secretaria'] }
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminDashboardComponent,
    providers: [provideHttpClient(withInterceptorsFromDi())],
    data: { roles: ['administrador'] }
  },
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    data: { roles: ['doctor'] },
    children: [
      {
        path: '',
        component: MedicoDashboardComponent
      },
      {
        path: 'evolucion/new',
        component: EvolucionMedicaComponent
      },
      {
        path: 'evolucion/:id',
        component: EvolucionMedicaComponent
      },
      {
        path: 'vital-signs/:id',
        component: VitalSignsListComponent
      },
      {
        path: 'evoluciones-paciente/:id',  // Corregido aquí
        component: EvolucionesPacienteComponent
      },
      {
        path: 'pacientes',
        component: PacientesMedicoComponent
      },
    ]
  },
  {
    path: 'secretaria',
    component: SecretaryDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['secretaria'] },
    children: [
      {
        path: '',
        redirectTo: 'patients',
        pathMatch: 'full'
      },
      {
        path: 'patients',
        component: PatientsComponent
      },
      {
        path: 'consultorios',
        component: ConsultoriosComponent
      },
      {
        path: 'citas',
        children: [
          {
            path: '',
            component: CitasListComponent
          },
          {
            path: 'nueva',
            component: CitaFormComponent
          },
          {
            path: ':id',
            component: CitasDetailComponent
          },
          {
            path: ':id/editar',
            component: CitaFormComponent
          }
        ]
      }
    ]
  },
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent 
  },
  {
    path: 'citas',
    canActivate: [AuthGuard],
    data: { roles: ['secretaria'] },
    children: [
      {
        path: '',
        component: CitasListComponent
      },
      {
        path: 'nueva',
        component: CitaFormComponent
      },
      {
        path: ':id',
        component: CitasDetailComponent
      },
      {
        path: ':id/editar',
        component: CitaFormComponent
      }
    ]
  },
  {
    path: 'enfermera',
    canActivate: [AuthGuard],
    data: { roles: ['enfermera'] },
    children: [
      {
        path: '',
        component: EnfermeraDashboardComponent
      },
      {
        path: 'vital-signs',
        component: VitalSignsListComponent
      },
      {
        path: 'vital-signs/new',
        component: VitalSignsFormComponent
      },
      {
        path: 'vital-signs/:id/edit',
        component: VitalSignsFormComponent
      }
    ]
},
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];


