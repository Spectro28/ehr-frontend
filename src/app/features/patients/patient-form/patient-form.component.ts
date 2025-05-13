import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
   empresas: string[] = ['CARDIOVASC', 'INVITROMED', 'Empresa 3'];
  isEditing = false;
  patientId: string | null = null;
  loading = false;
  errorMessage: string = '';
  successMessage: string = '';
  showAdditionalInfo = false; // Propiedad para controlar la visibilidad de la información adicional
  provincias: any[] = [];
  cantones: any[] = [];
  parroquias: any[] = [];

  // Nuevas propiedades para manejar el tab activo
  activeTab = 'patients';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.patientForm = this.fb.group({
      // Datos personales obligatorios
      apellido_paterno: ['', Validators.required],
      primer_nombre: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fecha_nacimiento: ['', Validators.required],
      lugar_nacimiento: ['', Validators.required],
      nacionalidad: ['', Validators.required],
      sexo: ['', Validators.required],
      empresa: ['Sin empresa', Validators.required],
      
      // Datos personales opcionales
      apellido_materno: [''],
      segundo_nombre: [''],
      telefono: ['', [Validators.pattern('^[0-9]{10}$')]],
      
      // Dirección (ahora opcional)
      direccion: [''],
      barrio: [''],
      provincia_id: [''],
      canton_id: [''],
      parroquia_id: [''],
      
      // Estado civil y otros datos (opcionales)
      estado_civil: [''],
      grupo_cultural: [''],
      instruccion: [''],
      ocupacion: [''],
      empresa_trabajo: [''],
      tipo_seguro: [''],
      
      // Contacto de emergencia (opcional)
      contacto_emergencia: [''],
      parentesco_emergencia: [''],
      direccion_emergencia: [''],
      telefono_emergencia: ['']
    });
  }

  ngOnInit() {
    // Cargar las provincias al iniciar el componente
    this.loadProvincias();
    
    // Verificar si estamos en modo edición
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.isEditing = true;
      this.loadPatient();
    }
  }

  // Método para alternar la visibilidad de la información adicional
  toggleAdditionalInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

  // Método para cambiar el tab activo
  setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log('Tab activo:', this.activeTab);
  }

  // Método para cerrar sesión
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

  // Resto de los métodos existentes...
  loadProvincias() {
    this.patientService.getProvincias().subscribe({
      next: (data) => {
        this.provincias = data;
      },
      error: (error) => console.error('Error cargando provincias:', error)
    });
  }

  onProvinciaChange(event: any) {
    const provinciaId = event.target.value;
    if (provinciaId) {
      this.patientForm.patchValue({ canton_id: '', parroquia_id: '' });
      this.cantones = [];
      this.parroquias = [];
      
      this.patientService.getCantones(provinciaId).subscribe({
        next: (data) => {
          this.cantones = data;
        },
        error: (error) => console.error('Error cargando cantones:', error)
      });
    }
  }

  onCantonChange(event: any) {
    const cantonId = event.target.value;
    if (cantonId) {
      this.patientForm.patchValue({ parroquia_id: '' });
      this.parroquias = [];
      
      this.patientService.getParroquias(cantonId).subscribe({
        next: (data) => {
          this.parroquias = data;
        },
        error: (error) => console.error('Error cargando parroquias:', error)
      });
    }
  }

  loadPatient() {
    if (this.patientId) {
      this.loading = true;
      this.patientService.getPatientById(this.patientId).subscribe({
        next: (patient) => {
          // Formatear la fecha antes de asignarla al formulario
          if (patient.fecha_nacimiento) {
            patient.fecha_nacimiento = formatDate(
              new Date(patient.fecha_nacimiento),
              'yyyy-MM-dd',
              'en-US'
            );
          }
          
          this.patientForm.patchValue(patient);
          
          // Cargar datos de ubicación si existen
          if (patient.provincia_id) {
            this.patientService.getCantones(patient.provincia_id).subscribe({
              next: (cantones) => {
                this.cantones = cantones;
                
                // Cargar parroquias si hay cantón seleccionado
                if (patient.canton_id) {
                  this.patientService.getParroquias(patient.canton_id).subscribe({
                    next: (parroquias) => {
                      this.parroquias = parroquias;
                    },
                    error: (error) => console.error('Error cargando parroquias:', error)
                  });
                }
              },
              error: (error) => console.error('Error cargando cantones:', error)
            });
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar paciente:', error);
          this.loading = false;
        }
      });
    }
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
  
      const patientData = { ...this.patientForm.value };
  
      // Formatear la fecha si existe
      if (patientData.fecha_nacimiento) {
        const date = new Date(patientData.fecha_nacimiento);
        patientData.fecha_nacimiento = date.toISOString().split('T')[0];
      }
  
      // Determinar si es actualización o creación
      const request = this.isEditing && this.patientId
        ? this.patientService.updatePatient(this.patientId, patientData)
        : this.patientService.createPatient(patientData);
  
      request.subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.loading = false;
          this.successMessage = this.isEditing 
            ? 'Paciente actualizado con éxito'
            : 'Paciente creado con éxito';
  
          // Esperar un momento antes de navegar
          setTimeout(() => {
            const userRole = this.authService.getUserRole();
            console.log('Rol del usuario:', userRole);
            
            if (userRole === 'secretaria') {
              this.router.navigate(['/secretaria'], { 
                queryParams: { tab: 'patients' }
              });
            } else {
              this.router.navigate(['/patients']);
            }
          }, 1500);
        },
        error: (error) => {
          console.error('Error al guardar paciente:', error);
          this.loading = false;
          
          // Verificar si el error es por cédula duplicada
          if (error.error && error.error.message === 'Ya existe otro paciente con esta cédula') {
            this.errorMessage = 'Ya existe un paciente registrado con esta cédula';
          } else {
            this.errorMessage = 'Error al guardar el paciente. Por favor, intente nuevamente.';
          }
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos requeridos correctamente.';
      // Marcar todos los campos inválidos como tocados
      Object.keys(this.patientForm.controls).forEach(key => {
        const control = this.patientForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
  
  // Método para cancelar
  cancel() {
    const userRole = this.authService.getUserRole();
    console.log('Cancelando - Rol del usuario:', userRole);
    
    if (userRole === 'secretaria') {
      this.router.navigate(['/secretaria'], {
        queryParams: { tab: 'patients' }
      });
    } else {
      this.router.navigate(['/patients']);
    }
  }
}