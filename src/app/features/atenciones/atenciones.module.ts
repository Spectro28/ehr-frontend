import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AtencionesRoutingModule } from './atenciones-routing.module';
import { AtencionesComponent } from './atenciones.component';


@NgModule({
  declarations: [
    AtencionesComponent
  ],
  imports: [
    CommonModule,
    AtencionesRoutingModule
  ]
})
export class AtencionesModule { }
