import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MedicoDashboardComponent } from './medico-dashboard.component';
import { EvolucionMedicaComponent } from './evolucion-medica/evolucion-medica.component';
import { OdontogramaComponent } from './pages/odontograma/odontograma.component';
import { PiezaDentalComponent } from './pages/odontograma/pieza-dental.component';
import { IndicesOdontologicosComponent } from './pages/odontograma/indices-odontologicos.component';

@NgModule({
  declarations: [
    MedicoDashboardComponent,
    EvolucionMedicaComponent,
    OdontogramaComponent,
    PiezaDentalComponent,
    IndicesOdontologicosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    OdontogramaComponent
  ]
})
export class MedicoDashboardModule { }
