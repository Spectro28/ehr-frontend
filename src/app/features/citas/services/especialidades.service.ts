import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

interface EspecialidadResponse {
  success: boolean;
  data: Especialidad[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  private endpoint = 'users/especialidades';

  constructor(private apiService: ApiService) { }

  obtenerEspecialidades(): Observable<Especialidad[]> {
    return this.apiService.get<{ success: boolean; data: string[] }>(this.endpoint).pipe(
      map(response => {
        // Convertir array de strings a array de objetos Especialidad
        return (response.data || []).map((nombre, index) => ({
          id: index + 1,
          nombre: nombre,
          descripcion: '',
          activo: true
        }));
      })
    );
  }

  obtenerEspecialidad(id: number): Observable<Especialidad> {
    return this.apiService.get<{ data: Especialidad }>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data)
    );
  }

  crearEspecialidad(data: Partial<Especialidad>): Observable<Especialidad> {
    return this.apiService.post<{ data: Especialidad }>(this.endpoint, data).pipe(
      map(response => response.data)
    );
  }

  actualizarEspecialidad(id: number, data: Partial<Especialidad>): Observable<Especialidad> {
    return this.apiService.put<{ data: Especialidad }>(`${this.endpoint}/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  eliminarEspecialidad(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
