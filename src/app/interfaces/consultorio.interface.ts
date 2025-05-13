export interface Consultorio {
    id: number;
    numero: string;
    descripcion?: string;
    doctorId: number;
    estado: string;
    doctor?: {
      id: number;
      username: string;
      especialidad: string;
    };
    horarios?: {
      id: number;
      dia: string;
      horaInicio: string;
      horaFin: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
  }