import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Consultorio {
  id?: number;
  nombre: string;
  especialidad: string;
  estado: boolean | 'activo';
  doctorId?: number;
  numero?: string;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HorarioConsultorio {
  id?: number;
  consultorioId: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  fecha?: Date;
  estado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  consultorio?: Consultorio;
}

// Interfaces
interface Cita {
  id: number;
  pacienteId: number;
  consultorioId: number;
  doctorId: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'atendido' | 'cancelado';
  notas?: string;
  paciente?: {
    id: number;
    primer_nombre: string;
    segundo_nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    cedula: string;
  };
  doctor?: {
    id: number;
    username: string;
    especialidad: string;
  };
  consultorio?: {
    id: number;
    numero: string;
  };
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

interface CitaCreate {
  pacienteId: number;
  consultorioId: number;
  doctorId: number;
  fecha: string;
  hora: string;
  notas?: string;
}

interface HorarioDisponible {
  hora: string;
  consultorioId: number;
  doctorId: number;
}

interface Paciente {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  cedula: string;
}

interface PacienteResponse {
  total: number;
  pages: number;
  currentPage: number;
  patients: Paciente[];
}

interface Doctor {
  id: number;
  username: string;
  especialidad: string;
  role?: string;
  roles?: string[];
  active: boolean;
  tipo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = environment.apiUrl;
  private citasUrl = `${this.apiUrl}/api/citas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  searchPacientes(query: string): Observable<Paciente[]> {
    console.log('Buscando pacientes con término:', query);
    
    const params = new HttpParams()
      .set('search', query)
      .set('limit', '10');
    
    return this.http.get<PacienteResponse>(`${this.apiUrl}/api/patients`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('Respuesta del servidor:', response);
        if (response && response.patients) {
          return response.patients;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error en searchPacientes:', error);
        return of([]);
      })
    );
  }

  // Actualizar también el método getPacientes si lo usas en otro lugar
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<PacienteResponse>(`${this.apiUrl}/api/patients`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response && response.patients) {
          return response.patients;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error en getPacientes:', error);
        return of([]);
      })
    );
  }

  // Obtener doctores y dentistas por especialidad
  getDoctoresByEspecialidad(especialidad: string): Observable<Doctor[]> {
    const params = new HttpParams().set('especialidad', especialidad);
    return this.http.get<{success: boolean, data: Doctor[]}>(`${this.apiUrl}/api/users/doctors`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        console.log('Respuesta de doctores por especialidad:', JSON.stringify(response, null, 2));
        if (response && response.data) {
          return response.data.map(prof => ({
            ...prof,
            especialidad: prof.roles?.includes('dentista') ? 'Odontología' : prof.especialidad || '',
            roles: prof.roles || []
          }));
        }
        return [];
      })
    );
  }

  // Obtener todos los doctores y dentistas
  getDoctores(): Observable<Doctor[]> {
    return this.http.get<{success: boolean, data: Doctor[]}>(`${this.apiUrl}/api/admin/users`, {
      headers: this.getHeaders(),
      params: { roles: 'doctor,dentista' }  // Obtener ambos roles
    }).pipe(
      map(response => {
        console.log('Respuesta completa de profesionales:', JSON.stringify(response, null, 2));
        let profesionales: Doctor[] = [];
        
        if (response && response.data) {
          profesionales = response.data;
        }

        return profesionales.map(prof => ({
          ...prof,
          especialidad: prof.roles?.includes('dentista') ? 'Odontología' : prof.especialidad || '',
          roles: prof.roles || []
        }));
      })
    );
  }

  // Obtener consultorios
  getConsultorios(): Observable<Consultorio[]> {
    return this.http.get<any>(`${this.apiUrl}/api/consultorios`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('Respuesta completa de consultorios:', JSON.stringify(response, null, 2));
        let consultorios: Consultorio[] = [];
        if (Array.isArray(response)) {
          consultorios = response;
        } else if (response && response.data) {
          consultorios = response.data;
        }
        // Asegurarse de que cada consultorio tenga el estado correcto
        return consultorios.map(c => ({
          ...c,
          estado: c.estado || 'activo'
        }));
      })
    );
  }

  // Buscar consultorio por doctorId
  findConsultorioByDoctorId(doctorId: number): Observable<Consultorio | null> {
    return this.getConsultorios().pipe(
      map(consultorios => {
        const consultorio = consultorios.find(c => c.doctorId === doctorId);
        console.log(`Consultorio encontrado para doctor ${doctorId}:`, consultorio);
        return consultorio || null;
      })
    );
  }

  // Obtener todas las citas
  getAllCitas(): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(this.citasUrl, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener las citas');
        }
        return response.data || [];
      })
    );
  }

  // Obtener una cita por ID
  getCitaById(id: number): Observable<Cita> {
    return this.http.get<ApiResponse<Cita>>(`${this.citasUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al obtener la cita');
        }
        return response.data;
      })
    );
  }

  verificarDisponibilidad(fecha: string, hora: string, consultorioId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('hora', hora)
      .set('consultorioId', consultorioId.toString());
  
    return this.http.get<ApiResponse<{disponible: boolean}>>(
      `${this.apiUrl}/api/citas/disponibilidad`, // Cambiado a /disponibilidad
      {
        params,
        headers: this.getHeaders()
      }
    ).pipe(
      map(response => {
        console.log('Respuesta verificación:', response);
        return response.data?.disponible || false;
      }),
      catchError(error => {
        console.error('Error al verificar disponibilidad:', error);
        return of(false);
      })
    );
  }

  createCita(citaData: CitaCreate): Observable<Cita> {
    return this.verificarDisponibilidad(citaData.fecha, citaData.hora, citaData.consultorioId).pipe(
      switchMap(disponible => {
        if (!disponible) {
          return throwError(() => new Error('El horario seleccionado ya no está disponible'));
        }
        return this.http.post<ApiResponse<Cita>>(`${this.apiUrl}/api/citas`, citaData, {
          headers: this.getHeaders()
        }).pipe(
          map(response => {
            if (!response.success || !response.data) {
              throw new Error(response.message || 'Error al crear la cita');
            }
            return response.data;
          })
        );
      })
    );
  }
  

  // Actualizar cita
  updateCita(id: number, citaData: Partial<CitaCreate>): Observable<Cita> {
    return this.http.put<ApiResponse<Cita>>(`${this.citasUrl}/${id}`, citaData, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al actualizar la cita');
        }
        return response.data;
      })
    );
  }

  // Eliminar cita
  deleteCita(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.citasUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar la cita');
        }
      })
    );
  }

  // Obtener citas por paciente
  getCitasByPaciente(pacienteId: number): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.citasUrl}/paciente/${pacienteId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener las citas del paciente');
        }
        return response.data || [];
      })
    );
  }

  // Obtener citas por doctor
  getCitasByDoctor(doctorId: number): Observable<Cita[]> {
    return this.http.get<ApiResponse<Cita[]>>(`${this.citasUrl}/doctor/${doctorId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener las citas del doctor');
        }
        return response.data || [];
      })
    );
  }

  // Obtener citas por consultorio
  getCitasByConsultorio(consultorioId: number): Observable<any[]> {
    return this.http.get<{success: boolean, data: any[]}>(`${this.apiUrl}/api/citas/consultorio/${consultorioId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        // Ahora TypeScript sabe que response tiene success y data
        if (response && response.success) {
          return response.data.map((cita: any) => ({
            ...cita,
            fecha: new Date(cita.fecha),
            estado: cita.estado || 'pendiente'
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener citas del consultorio:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener horarios disponibles
  getHorariosDisponibles(consultorioId: number, fecha: string, doctorId: number): Observable<any[]> {
    const params = new HttpParams()
      .set('consultorioId', consultorioId.toString())
      .set('fecha', fecha)
      .set('doctorId', doctorId.toString());
  
    return this.http.get<any>(`${this.apiUrl}/api/citas/horarios-disponibles`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener horarios');
      }),
      catchError(error => {
        console.error('Error en getHorariosDisponibles:', error);
        return throwError(() => error);
      })
    );
  }

  // Actualizar estado de cita
  updateEstadoCita(id: number, estado: 'pendiente' | 'atendido' | 'cancelado'): Observable<Cita> {
    return this.http.patch<ApiResponse<Cita>>(`${this.citasUrl}/${id}/estado`, { estado }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Error al actualizar el estado de la cita');
        }
        return response.data;
      })
    );
  }
}