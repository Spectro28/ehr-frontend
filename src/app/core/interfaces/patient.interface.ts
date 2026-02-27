export interface Patient {
  id: number;
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  telefono: string;
  genero: string;
  edad: number;
  fecha_nacimiento: string;
  fechaNacimiento?: string;
  tipoSangre?: string;
  alergias?: string;
  antecedentes?: string;
  provincia_id?: number;
  canton_id?: number;
  parroquia_id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  cedula: string;
  username: string;
  primer_nombre: string;
  segundo_nombre?: string;
  apellido_paterno: string;
  apellido_materno?: string;
  email: string;
  telefono?: string;
  especialidad: string;
  active: boolean;
  roles: string[];
  tipo?: string;
}
