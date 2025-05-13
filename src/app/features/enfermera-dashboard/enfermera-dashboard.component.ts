import { Component } from '@angular/core';
import { VitalSignsService } from '../../core/services/vital-signs.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-enfermera-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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

  constructor(
    private vitalSignsService: VitalSignsService,
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
    this.loadPendingAppointments();
    this.loadCompletedVitalSigns();
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