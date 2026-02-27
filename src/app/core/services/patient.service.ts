import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient } from '../interfaces/patient.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/api/patients`;

  constructor(private http: HttpClient) {}

  getPatients(params?: any): Observable<{ patients: Patient[]; total: number; pages: number }> {
    return this.http.get<{ patients: Patient[]; total: number; pages: number }>(this.apiUrl, { params });
  }

  getPatient(id: number): Observable<{ data: Patient }> {
    return this.http.get<{ data: Patient }>(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: Partial<Patient>): Observable<{ data: Patient; id: number }> {
    return this.http.post<{ data: Patient; id: number }>(this.apiUrl, patient);
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<{ data: Patient }> {
    return this.http.put<{ data: Patient }>(`${this.apiUrl}/${id}`, patient);
  }

  deletePatient(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getProvincias(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/ubicacion/provincias`);
  }
  
  getCantones(provinciaId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/ubicacion/cantones/${provinciaId}`);
  }
  
  getParroquias(cantonId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/ubicacion/parroquias/${cantonId}`);
  }
  getPacientesSinIdentificacion(): Observable<{ patients: any[], total: number }> {
  return this.http.get<{ patients: any[], total: number }>(
    `${this.apiUrl}/sin-identificacion`
  );
}
}