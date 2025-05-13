import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  // No olvides CommonModule
import { FormsModule } from '@angular/forms';   // Asegúrate de importar FormsModule
import { LoginComponent } from './login.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,  // Asegúrate de que FormsModule esté aquí también
    LoginComponent
  ],
  exports: [LoginComponent]
})
export class LoginModule {}
