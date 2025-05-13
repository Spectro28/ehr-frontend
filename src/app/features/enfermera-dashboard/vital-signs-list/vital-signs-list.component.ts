import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Para el pipe date
import { RouterModule } from '@angular/router'; // Para routerLink
import { ReactiveFormsModule } from '@angular/forms'; // Para formGroup
import { FormBuilder, FormGroup } from '@angular/forms';
import { VitalSignsService } from '../../../core/services/vital-signs.service';
import { catchError, finalize, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vital-signs-list',
  standalone: true, // Asegúrate de que el componente sea standalone
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './vital-signs-list.component.html',
  styleUrls: ['./vital-signs-list.component.css']
})
export class VitalSignsListComponent implements OnInit, OnDestroy {
  vitalSigns: any[] = [];
  filterForm: FormGroup;
  loading = false;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private vitalSignsService: VitalSignsService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      fecha: [''],
      paciente: ['']
    });
  }

  ngOnInit() {
    this.loadVitalSigns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVitalSigns() {
    this.loading = true;
    this.error = '';

    this.vitalSignsService.getCompletedVitalSigns()
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error al cargar registros:', err);
          this.error = err.message || 'Error al cargar los registros';
          return [];
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && Array.isArray(response)) {
            this.vitalSigns = response;
          } else {
            console.warn('Respuesta inesperada:', response);
            this.vitalSigns = [];
            this.error = 'Formato de respuesta inválido';
          }
        },
        error: (err) => {
          console.error('Error en la suscripción:', err);
          this.error = 'Error al procesar la respuesta';
          this.vitalSigns = [];
        }
      });
  }

  onFilter() {
    const filters = this.filterForm.value;
    this.loadVitalSigns();
  }

  deleteRecord(id: number) {
    if (confirm('¿Está seguro de eliminar este registro?')) {
      this.loading = true;
      this.vitalSignsService.delete(id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            this.error = 'Error al eliminar el registro';
            console.error('Error al eliminar:', err);
            return [];
          }),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: () => {
            this.loadVitalSigns();
          },
          error: (err) => {
            this.error = 'Error al eliminar el registro';
          }
        });
    }
  }
}