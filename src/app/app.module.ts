import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importante para trabajar con formularios
import { HttpClientModule } from '@angular/common/http'; // Para hacer solicitudes HTTP
import { LoginModule } from './features/login/login.module';
import { CommonModule } from '@angular/common';
// Componentes
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminComponent } from './features/admin/admin.component';
import { UnauthorizedComponent } from './features/NoAutorizado/unauthorized.component';
import { ConsultorioService } from './core/services/consultorio.service';



// Servicios
import { AuthService } from './core/services/auth.service';
import { AuthGuard } from './core/guards/auth.guard';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,  // Declara DashboardComponent
    AdminComponent,
    UnauthorizedComponent       // Declara AdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,          // Importa FormsModule si estás trabajando con formularios template-driven
    ReactiveFormsModule,  // Importa ReactiveFormsModule si estás trabajando con formularios reactivos
    HttpClientModule,     // Importa HttpClientModule para solicitudes HTTP
    LoginModule,
    CommonModule
  ],
  providers: [
    AuthService, // Provee AuthService
    AuthGuard,
    ConsultorioService,    // Provee AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
