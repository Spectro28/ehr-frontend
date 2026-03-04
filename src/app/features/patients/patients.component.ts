import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';

@Component({
    selector: 'app-patient',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './patients.component.html',
    styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  Math = Math;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    const params = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm
    };

    this.patientService.getPatients(params).subscribe({
      next: (response) => {
        this.patients = response.patients;
        this.totalItems = response.total;
        this.totalPages = response.pages;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        // Aquí podrías mostrar un mensaje de error
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPatients();
  }

  changePage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPatients();
    }
  }

  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 3) {
        pages.push('...');
      }

      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  deletePatient(id: string) {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.patientService.deletePatient(Number(id)).subscribe({
        next: () => {
          this.loadPatients();
          // Aquí podrías mostrar un mensaje de éxito
        },
        error: (error) => {
          console.error('Error al eliminar paciente:', error);
          // Aquí podrías mostrar un mensaje de error
        }
      });
    }
  }
}