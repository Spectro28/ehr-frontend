import { Patient } from './patient.interface';
import { Doctor } from './patient.interface';

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

interface CitaPatient {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  cedula: string;
  email: string;
  telefono: string;
}

interface CitaDoctor {
  id: number;
  username: string;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  especialidad: string;
  active: boolean;
}

export interface Cita {
  id: number;
  pacienteId: number;
  doctorId: number;
  consultorioId: number;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'atendido' | 'cancelado';
  motivo?: string;
  observaciones?: string;
  paciente?: CitaPatient;
  doctor?: CitaDoctor;
  consultorio?: Consultorio;
  createdAt?: string;
  updatedAt?: string;
}

export interface CitaResponse {
  success: boolean;
  data: Cita;
  message?: string;
}

export interface CitasResponse {
  data: Cita[];
  total: number;
  pages: number;
}
