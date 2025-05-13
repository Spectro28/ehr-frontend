import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from '../../../core/services/catalogos.service';

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent implements OnInit {
  activeCatalog: string = 'ubicaciones';
  loading = false;
  error = '';
  success = '';
  // Forms visibility
  showProvinciaForm = false;
  showCantonForm = false;
  showParroquiaForm = false;

  // Search filters
  searchProvincia = '';
  searchCanton = '';
  searchParroquia = '';

  // Data arrays
  provincias: any[] = [];
  cantones: any[] = [];
  parroquias: any[] = [];

   // CIE-10 properties
   cie10Categories: any[] = [];
   cie10Subcategories: any[] = [];
   searchCie10Query: string = '';
   cie10SearchResults: any[] = [];
   cie10Form: FormGroup = new FormGroup({});
   showCie10Form = false;
   editingCie10Id: number | null = null;
   selectedParentId: number | null = null;

    // Propiedades para medicamentos
  medicamentos: any[] = [];
  searchMedicamentoQuery: string = '';
  medicamentoForm: FormGroup = new FormGroup({});
  showMedicamentoForm = false;
  editingMedicamentoId: number | null = null;

  // Filtered arrays
  get filteredProvincias() {
    if (!this.provincias || !Array.isArray(this.provincias)) {
        return [];
    }
    return this.provincias.filter(p => 
        p.nombre.toLowerCase().includes(this.searchProvincia.toLowerCase())
    );
}

get filteredCantones() {
  if (!this.cantones || !Array.isArray(this.cantones)) {
      return [];
  }
  return this.cantones.filter(c => 
      c.nombre.toLowerCase().includes(this.searchCanton.toLowerCase()) ||
      (c.Provincia?.nombre || '').toLowerCase().includes(this.searchCanton.toLowerCase())
  );
}

get filteredParroquias() {
  if (!this.parroquias || !Array.isArray(this.parroquias)) {
      return [];
  }
  return this.parroquias.filter(p => 
      p.nombre.toLowerCase().includes(this.searchParroquia.toLowerCase()) ||
      (p.Canton?.nombre || '').toLowerCase().includes(this.searchParroquia.toLowerCase())
  );
}

get filteredCie10() {
  if (!this.searchCie10Query) {
    return this.cie10Categories;
  }
  return this.cie10Categories.filter(cie => 
    cie.codigo.toLowerCase().includes(this.searchCie10Query.toLowerCase()) ||
    cie.nombre.toLowerCase().includes(this.searchCie10Query.toLowerCase())
  );
}
  // Forms
  provinciaForm: FormGroup = new FormGroup({});
  cantonForm: FormGroup = new FormGroup({});
  parroquiaForm: FormGroup = new FormGroup({});

  // Editing states
  editingProvincia: number | null = null;
  editingCanton: number | null = null;
  editingParroquia: number | null = null;

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.provinciaForm = this.fb.group({
      nombre: ['', Validators.required],
    });

    this.cantonForm = this.fb.group({
      nombre: ['', Validators.required],
      provincia_id: ['', Validators.required]
    });

    this.parroquiaForm = this.fb.group({
      nombre: ['', Validators.required],
      canton_id: ['', Validators.required]
    });
    this.cie10Form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      cie_id: [null],
      versioncie: ['CIE10'],
      ctsexo_id: [null],
      edadmin: [null],
      unidadedadmin: [null],
      edadmax: [null],
      unidadedadmax: [null],
      estado: [1]
    });
    this.medicamentoForm = this.fb.group({
      nombre_generico: ['', Validators.required],
      nombre_comercial: [''],
      forma_farmaceutica: ['', Validators.required],
      concentracion: ['', Validators.required],
      via_administracion: ['', Validators.required],
      categoria: [''],
      estado: [true]
    });
  }

  ngOnInit() {
    this.loadUbicaciones();
    this.loadCie10Categories();
    this.loadMedicamentos();
  }

  onSubmitProvincia() {
    if (this.provinciaForm.valid) {
      if (this.editingProvincia) {
        this.updateProvincia(this.editingProvincia, this.provinciaForm.value);
      } else {
        this.createProvincia(this.provinciaForm.value);
      }
    }
  }

  createProvincia(data: any) {
    this.loading = true;
    this.catalogosService.createProvincia(data).subscribe({
        next: (response) => {
            this.success = 'Provincia creada exitosamente';
            this.loadProvincias();
            this.cancelProvinciaForm();
        },
        error: (error) => {
            this.error = error.error.message || 'Error al crear provincia';
        },
        complete: () => {
            this.loading = false;
        }
    });
}

  updateProvincia(id: number, data: any) {
    this.loading = true;
    this.catalogosService.updateProvincia(id, data).subscribe({
      next: () => {
        this.success = 'Provincia actualizada exitosamente';
        this.loadProvincias();
        this.cancelProvinciaForm();
      },
      error: (error) => {
        this.error = error.error.message || 'Error al actualizar provincia';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  editProvincia(provincia: any) {
    this.editingProvincia = provincia.id;
    this.provinciaForm.patchValue({
        nombre: provincia.nombre
    });
    this.showProvinciaForm = true;
}

  deleteProvincia(id: number) {
    if (confirm('¿Está seguro de eliminar esta provincia?')) {
      this.loading = true;
      this.catalogosService.deleteProvincia(id).subscribe({
        next: () => {
          this.success = 'Provincia eliminada exitosamente';
          this.loadProvincias();
        },
        error: (error) => {
          this.error = error.error.message || 'Error al eliminar provincia';
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  cancelProvinciaForm() {
    this.showProvinciaForm = false;
    this.editingProvincia = null;
    this.provinciaForm.reset();
  }

  // Método para limpiar mensajes
  private clearMessages() {
    setTimeout(() => {
      this.error = '';
      this.success = '';
    }, 3000);
  }

  // Actualizar los métodos de carga





  // Canton methods
  onSubmitCanton() {
    if (this.cantonForm.valid) {
      if (this.editingCanton) {
        this.updateCanton(this.editingCanton, this.cantonForm.value);
      } else {
        this.createCanton(this.cantonForm.value);
      }
    }
  }

  createCanton(data: any) {
    this.catalogosService.createCanton(data).subscribe({
      next: () => {
        this.loadCantones();
        this.cancelCantonForm();
      },
      error: (error) => console.error('Error creating canton:', error)
    });
  }

  updateCanton(id: number, data: any) {
    this.catalogosService.updateCanton(id, data).subscribe({
      next: () => {
        this.loadCantones();
        this.cancelCantonForm();
      },
      error: (error) => console.error('Error updating canton:', error)
    });
  }

  editCanton(canton: any) {
    this.editingCanton = canton.id;
    this.cantonForm.patchValue({
      nombre: canton.nombre,
      provincia_id: canton.provincia_id
    });
    this.showCantonForm = true;
  }

  deleteCanton(id: number) {
    if (confirm('¿Está seguro de eliminar este cantón?')) {
      this.catalogosService.deleteCanton(id).subscribe({
        next: () => this.loadCantones(),
        error: (error) => console.error('Error deleting canton:', error)
      });
    }
  }

  cancelCantonForm() {
    this.showCantonForm = false;
    this.editingCanton = null;
    this.cantonForm.reset();
  }

  // Parroquia methods
  onSubmitParroquia() {
    if (this.parroquiaForm.valid) {
      if (this.editingParroquia) {
        this.updateParroquia(this.editingParroquia, this.parroquiaForm.value);
      } else {
        this.createParroquia(this.parroquiaForm.value);
      }
    }
  }

  createParroquia(data: any) {
    this.catalogosService.createParroquia(data).subscribe({
      next: () => {
        this.loadParroquias();
        this.cancelParroquiaForm();
      },
      error: (error) => console.error('Error creating parroquia:', error)
    });
  }

  updateParroquia(id: number, data: any) {
    this.catalogosService.updateParroquia(id, data).subscribe({
      next: () => {
        this.loadParroquias();
        this.cancelParroquiaForm();
      },
      error: (error) => console.error('Error updating parroquia:', error)
    });
  }

  editParroquia(parroquia: any) {
    this.editingParroquia = parroquia.id;
    this.parroquiaForm.patchValue({
      nombre: parroquia.nombre,
      canton_id: parroquia.canton_id
    });
    this.showParroquiaForm = true;
  }

  deleteParroquia(id: number) {
    if (confirm('¿Está seguro de eliminar esta parroquia?')) {
      this.catalogosService.deleteParroquia(id).subscribe({
        next: () => this.loadParroquias(),
        error: (error) => console.error('Error deleting parroquia:', error)
      });
    }
  }

  cancelParroquiaForm() {
    this.showParroquiaForm = false;
    this.editingParroquia = null;
    this.parroquiaForm.reset();
  }

  // Utility methods
  setCatalog(catalog: string) {
    this.activeCatalog = catalog;
    if (catalog === 'cie') {
      this.loadCie10Categories();
    }
  }

  private loadUbicaciones() {
    this.loadProvincias();
    this.loadCantones();
    this.loadParroquias();
  }

  private loadProvincias() {
    this.loading = true;
    this.catalogosService.getProvincias().subscribe({
      next: (response) => {
        this.provincias = response.data || [];
      },
      error: (error) => {
        console.error('Error loading provincias:', error);
        this.error = 'Error al cargar provincias';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private loadCantones() {
    this.loading = true;
    this.catalogosService.getCantones().subscribe({
        next: (response) => {
            this.cantones = response.data || [];
            this.loading = false;
        },
        error: (error) => {
            console.error('Error loading cantones:', error);
            this.error = 'Error al cargar cantones';
            this.loading = false;
        }
    });
}

private loadParroquias() {
    this.loading = true;
    this.catalogosService.getParroquias().subscribe({
        next: (response) => {
            this.parroquias = response.data || [];
            this.loading = false;
        },
        error: (error) => {
            console.error('Error loading parroquias:', error);
            this.error = 'Error al cargar parroquias';
            this.loading = false;
        }
    });
}

 // CIE-10 Methods
 loadCie10Categories() {
  this.loading = true;
  this.catalogosService.getCie10Categories().subscribe({
    next: (response) => {
      this.cie10Categories = response.data;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading CIE categories:', error);
      this.error = 'Error al cargar categorías CIE';
      this.loading = false;
    }
  });
}

  // Método para ver subcategorías
  viewSubcategories(parentId: number) {
    this.loading = true;
    this.selectedParentId = parentId;
    this.catalogosService.getCie10Subcategories(parentId).subscribe({
      next: (response) => {
        this.cie10Subcategories = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        this.error = 'Error al cargar subcategorías';
        this.loading = false;
      }
    });
  }


loadCie10Subcategories(parentId: number) {
  this.loading = true;
  this.selectedParentId = parentId;
  this.catalogosService.getCie10Subcategories(parentId).subscribe({
    next: (response) => {
      this.cie10Subcategories = response.data;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading CIE-10 subcategories:', error);
      this.error = 'Error al cargar subcategorías CIE-10';
      this.loading = false;
    }
  });
}

  onSearchCie10() {
    if (this.searchCie10Query.length >= 2) {
      this.loading = true;
      this.catalogosService.searchCie10(this.searchCie10Query).subscribe({
        next: (response) => {
          this.cie10Categories = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching CIE:', error);
          this.error = 'Error en la búsqueda';
          this.loading = false;
        }
      });
    } else if (this.searchCie10Query.length === 0) {
      this.loadCie10Categories(); // Recargar todas las categorías si el buscador está vacío
    }
  }


  showCreateCie10Form() {
    this.editingCie10Id = null;
    this.cie10Form.reset({
      versioncie: 'CIE10',
      estado: 1
    });
    this.showCie10Form = true;
  }

editCie10(cie: any) {
  this.editingCie10Id = cie.id;
  this.cie10Form.patchValue({
    codigo: cie.codigo,
    nombre: cie.nombre,
    cie_id: cie.cie_id,
    versioncie: cie.versioncie,
    ctsexo_id: cie.ctsexo_id,
    edadmin: cie.edadmin,
    unidadedadmin: cie.unidadedadmin,
    edadmax: cie.edadmax,
    unidadedadmax: cie.unidadedadmax,
    estado: cie.estado
  });
  this.showCie10Form = true;
}

onCie10Submit() {
  if (this.cie10Form.valid) {
    this.loading = true;
    const data = this.cie10Form.value;

    const request = this.editingCie10Id
      ? this.catalogosService.updateCie10(this.editingCie10Id, data)
      : this.catalogosService.createCie10(data);

    request.subscribe({
      next: () => {
        if (this.selectedParentId) {
          this.loadCie10Subcategories(this.selectedParentId);
        } else {
          this.loadCie10Categories();
        }
        this.cancelCie10Form();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving CIE-10:', error);
        this.error = 'Error al guardar código CIE-10';
        this.loading = false;
      }
    });
  }
}

deleteCie10(id: number) {
  if (confirm('¿Está seguro de eliminar este código CIE-10?')) {
    this.loading = true;
    this.catalogosService.deleteCie10(id).subscribe({
      next: () => {
        if (this.selectedParentId) {
          this.loadCie10Subcategories(this.selectedParentId);
        } else {
          this.loadCie10Categories();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting CIE-10:', error);
        this.error = 'Error al eliminar código CIE-10';
        this.loading = false;
      }
    });
  }
}


cancelCie10Form() {
  this.showCie10Form = false;
  this.editingCie10Id = null;
  this.cie10Form.reset();
}

// Getters para filtrado
get filteredCie10Categories() {
  return this.cie10Categories.filter(cat => 
    cat.codigo.toLowerCase().includes(this.searchCie10Query.toLowerCase()) ||
    cat.descripcion.toLowerCase().includes(this.searchCie10Query.toLowerCase())
  );
}

get filteredCie10Subcategories() {
  return this.cie10Subcategories.filter(sub => 
    sub.codigo.toLowerCase().includes(this.searchCie10Query.toLowerCase()) ||
    sub.descripcion.toLowerCase().includes(this.searchCie10Query.toLowerCase())
  );
}

// Cargar medicamentos
loadMedicamentos() {
  this.loading = true;
  this.catalogosService.getMedicamentos().subscribe({
    next: (response) => {
      this.medicamentos = response.data;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading medicamentos:', error);
      this.error = 'Error al cargar medicamentos';
      this.loading = false;
    }
  });
}

// Búsqueda de medicamentos
onSearchMedicamentos() {
  if (this.searchMedicamentoQuery.length >= 2) {
    this.loading = true;
    this.catalogosService.searchMedicamentos(this.searchMedicamentoQuery).subscribe({
      next: (response) => {
        this.medicamentos = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching medicamentos:', error);
        this.error = 'Error en la búsqueda';
        this.loading = false;
      }
    });
  } else if (this.searchMedicamentoQuery.length === 0) {
    this.loadMedicamentos();
  }
}

// Mostrar formulario de creación
showCreateMedicamentoForm() {
  this.editingMedicamentoId = null;
  this.medicamentoForm.reset({
    estado: true
  });
  this.showMedicamentoForm = true;
}

// Editar medicamento
editMedicamento(medicamento: any) {
  this.editingMedicamentoId = medicamento.id;
  this.medicamentoForm.patchValue({
    nombre_generico: medicamento.nombre_generico,
    nombre_comercial: medicamento.nombre_comercial,
    forma_farmaceutica: medicamento.forma_farmaceutica,
    concentracion: medicamento.concentracion,
    via_administracion: medicamento.via_administracion,
    categoria: medicamento.categoria,
    estado: medicamento.estado
  });
  this.showMedicamentoForm = true;
}

// Guardar medicamento (crear o actualizar)
onMedicamentoSubmit() {
  if (this.medicamentoForm.valid) {
    this.loading = true;
    const data = this.medicamentoForm.value;

    const request = this.editingMedicamentoId
      ? this.catalogosService.updateMedicamento(this.editingMedicamentoId, data)
      : this.catalogosService.createMedicamento(data);

    request.subscribe({
      next: () => {
        this.success = `Medicamento ${this.editingMedicamentoId ? 'actualizado' : 'creado'} exitosamente`;
        this.loadMedicamentos();
        this.cancelMedicamentoForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving medicamento:', error);
        this.error = `Error al ${this.editingMedicamentoId ? 'actualizar' : 'crear'} medicamento`;
        this.loading = false;
      }
    });
  }
}

// Eliminar medicamento
deleteMedicamento(id: number) {
  if (confirm('¿Está seguro de eliminar este medicamento?')) {
    this.loading = true;
    this.catalogosService.deleteMedicamento(id).subscribe({
      next: () => {
        this.success = 'Medicamento eliminado exitosamente';
        this.loadMedicamentos();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting medicamento:', error);
        this.error = 'Error al eliminar medicamento';
        this.loading = false;
      }
    });
  }
}

// Cancelar formulario
cancelMedicamentoForm() {
  this.showMedicamentoForm = false;
  this.editingMedicamentoId = null;
  this.medicamentoForm.reset();
}

// Getter para filtrado de medicamentos
get filteredMedicamentos() {
  if (!this.searchMedicamentoQuery) {
    return this.medicamentos;
  }
  return this.medicamentos.filter(med => 
    med.nombre_generico.toLowerCase().includes(this.searchMedicamentoQuery.toLowerCase()) ||
    med.nombre_comercial?.toLowerCase().includes(this.searchMedicamentoQuery.toLowerCase())
  );
}

}