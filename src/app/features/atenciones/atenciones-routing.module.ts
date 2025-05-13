import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AtencionesComponent } from './atenciones.component';

const routes: Routes = [{ path: '', component: AtencionesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AtencionesRoutingModule { }
