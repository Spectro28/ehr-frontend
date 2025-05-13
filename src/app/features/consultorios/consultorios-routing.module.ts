import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultoriosComponent } from './consultorios.component';

const routes: Routes = [{ path: '', component: ConsultoriosComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultoriosRoutingModule { }
