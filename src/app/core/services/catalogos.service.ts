import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogosService {
  private apiUrl = `${environment.apiUrl}/api/catalogos`; // Agregamos '/api' a la ruta

  constructor(private http: HttpClient) {}

  // Provincias
  getProvincias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/provincias`);
  }

  createProvincia(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/provincias`, data);
  }

  updateProvincia(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/provincias/${id}`, data);
  }

  deleteProvincia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/provincias/${id}`);
  }

  // Cantones
  getCantones(provinciaId?: number): Observable<any> {
    const url = provinciaId 
      ? `${this.apiUrl}/cantones?provincia_id=${provinciaId}` // Cambiado a provincia_id para coincidir con el backend
      : `${this.apiUrl}/cantones`;
    return this.http.get(url);
  }

  createCanton(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cantones`, data);
  }

  updateCanton(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cantones/${id}`, data);
  }

  deleteCanton(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cantones/${id}`);
  }

  // Parroquias
  getParroquias(cantonId?: number): Observable<any> {
    const url = cantonId 
      ? `${this.apiUrl}/parroquias?canton_id=${cantonId}` // Cambiado a canton_id para coincidir con el backend
      : `${this.apiUrl}/parroquias`;
    return this.http.get(url);
  }

  createParroquia(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/parroquias`, data);
  }

  updateParroquia(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/parroquias/${id}`, data);
  }

  deleteParroquia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/parroquias/${id}`);
  }

    // CIE-10 Methods
    getCie10Categories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/cie10/categories`);
      }
    
      getCie10Subcategories(parentId?: number): Observable<any> {
        const url = parentId 
          ? `${this.apiUrl}/cie10/subcategories?parent_id=${parentId}`
          : `${this.apiUrl}/cie10/subcategories`;
        return this.http.get(url);
      }
    
      searchCie10(query: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/cie10/search?query=${query}`);
      }
    
      createCie10(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/cie10`, data);
      }
    
      updateCie10(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/cie10/${id}`, data);
      }
    
      deleteCie10(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/cie10/${id}`);
      }

       // Obtener todos los medicamentos
       getMedicamentos(): Observable<any> {
        return this.http.get(`${this.apiUrl}/medicamentos`);
      }
    
      searchMedicamentos(query: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/medicamentos/search`, {
          params: { query }
        });
      }
    
      createMedicamento(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/medicamentos`, data);
      }
    
      updateMedicamento(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/medicamentos/${id}`, data);
      }
    
      deleteMedicamento(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/medicamentos/${id}`);
      }
}