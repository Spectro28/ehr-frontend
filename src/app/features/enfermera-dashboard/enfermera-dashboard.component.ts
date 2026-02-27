import { Component, ViewChild, ElementRef } from '@angular/core';
import { VitalSignsService } from '../../core/services/vital-signs.service';
import { PatientService } from '../../core/services/patient.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RoleSwitcherComponent } from '../../shared/components/role-switcher/role-switcher.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-enfermera-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, RoleSwitcherComponent],
  templateUrl: './enfermera-dashboard.component.html',
  styleUrl: './enfermera-dashboard.component.css'
})
export class EnfermeraDashboardComponent {
  pendingAppointments: any[] = [];
  completedVitalSigns: any[] = [];
  loading = false;
  loadingVitalSigns = false;
  error = '';
  filterForm: FormGroup;
  userNameWithPrefix: string = '';

  // Alertas de pacientes sin identificación
  pacientesSinIdentificacion: any[] = [];
  mostrarAlertas: boolean[] = [];

  @ViewChild('alertAudio', { static: false }) alertAudio!: ElementRef<HTMLAudioElement>;

  constructor(
    private authService: AuthService,
    private vitalSignsService: VitalSignsService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      fecha: [''],
      paciente: ['']
    });
    // Suscribirse a los cambios del formulario
    this.filterForm.valueChanges.subscribe(() => {
      this.onFilter();
    });
  }

  ngOnInit() {
    this.userNameWithPrefix = this.authService.getUserDisplayName();
    this.loadPendingAppointments();
    this.loadCompletedVitalSigns();
    this.checkPacientesSinIdentificacion();
  }

  checkPacientesSinIdentificacion() {
    this.patientService.getPatients({}).subscribe({
      next: (data) => {
        // Filtrar pacientes con identificacion no_identificado o que empiece con 0000
        this.pacientesSinIdentificacion = (data.patients || data).filter((p: any) =>
          p.tipo_identificacion === 'no_identificado' ||
          (typeof p.cedula === 'string' && p.cedula.startsWith('0000'))
        );
        this.mostrarAlertas = this.pacientesSinIdentificacion.map(() => true);
        // Las alertas NO se ocultan automáticamente, son persistentes
      },
      error: (error) => {
        console.error('Error al obtener pacientes:', error);
      }
    });
  }

  irAEditarPaciente(paciente: any) {
    this.router.navigate(['/patients', paciente.id, 'edit']);
  }

  loadPendingAppointments() {
    this.loading = true;
    this.vitalSignsService.getPendingAppointments().subscribe({
      next: (data) => {
        this.pendingAppointments = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las citas pendientes';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  editRecord(record: any) {
    this.router.navigate(['/enfermera/vital-signs', record.id, 'edit']);
  }

  loadCompletedVitalSigns() {
    this.loadingVitalSigns = true;
    
    // Preparar los filtros
    const filters: any = {};
    
    if (this.filterForm.get('fecha')?.value) {
      filters.fecha = this.filterForm.get('fecha')?.value;
    }
    
    if (this.filterForm.get('paciente')?.value) {
      filters.searchTerm = this.filterForm.get('paciente')?.value;
    }

    console.log('Aplicando filtros:', filters);

    this.vitalSignsService.getCompletedVitalSigns(filters).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.completedVitalSigns = data;
        this.loadingVitalSigns = false;
      },
      error: (error) => {
        console.error('Error al cargar los signos vitales:', error);
        this.error = 'Error al cargar los signos vitales';
        this.loadingVitalSigns = false;
      }
    });
  }

  refreshLists() {
    this.loadPendingAppointments();
    this.loadCompletedVitalSigns();
  }

  onFilter() {
    // Debounce para evitar muchas llamadas
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    
    this.filterTimeout = setTimeout(() => {
      this.loadCompletedVitalSigns();
    }, 300);
  }

  private filterTimeout: any;

  logCitaId(cita: any) {
    console.log('ID de la cita seleccionada:', cita.id);
    console.log('Datos completos de la cita:', cita);
  }

  deleteRecord(id: number) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.vitalSignsService.delete(id).subscribe({
        next: () => {
          this.loadCompletedVitalSigns();
        },
        error: (error) => {
          this.error = 'Error al eliminar el registro';
          console.error('Error:', error);
        }
      });
    }
  }

  cerrarSesion() {
    // Aquí puedes agregar la lógica para cerrar sesión
    // Por ejemplo:
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      // Llamar al servicio de autenticación para cerrar sesión
      // this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}