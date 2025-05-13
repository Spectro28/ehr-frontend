import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/api/patients`;

  constructor(private http: HttpClient) {}

  getPatients(params: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  getPatientById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPatient(patient: any): Observable<any> {
    return this.http.post(this.apiUrl, patient);
}

  updatePatient(id: string, patient: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patient);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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
}