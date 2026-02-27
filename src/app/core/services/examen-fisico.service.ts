import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LesionCatalogItem { id: number; nombre: string; codigo?: string; }
export interface BodyPartItem { id: number; nombre: string; codigo?: string; vista: 'anverso'|'reverso'; svg_id?: string; }

export interface ExamenFisicoItemLesionDTO { lesionId?: number; lesionTexto?: string; }
export interface ExamenFisicoItemDTO {
  bodyPartId?: number;
  bodyPartNombre: string;
  observaciones?: string;
  lesiones: ExamenFisicoItemLesionDTO[];
}

export interface ExamenFisicoUpsertDTO {
  evolucionId: number;
  vistaInicial?: 'anverso'|'reverso';
  items: ExamenFisicoItemDTO[];
}

@Injectable({ providedIn: 'root' })
export class ExamenFisicoService {
  private base = `${environment.apiUrl}/api/examen-fisico`;

  constructor(private http: HttpClient) {}

  getCatalogos(): Observable<{ success: boolean; data: { partes: BodyPartItem[]; lesiones: LesionCatalogItem[] } }> {
    return this.http.get<{ success: boolean; data: { partes: BodyPartItem[]; lesiones: LesionCatalogItem[] } }>(`${this.base}/catalogos`);
  }

  getByEvolucion(evolucionId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/evolucion/${evolucionId}`);
  }

  upsert(payload: ExamenFisicoUpsertDTO): Observable<any> {
    return this.http.post<any>(`${this.base}/upsert`, payload);
  }
}


