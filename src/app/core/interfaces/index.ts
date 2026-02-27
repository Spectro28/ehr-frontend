import { Patient } from './patient.interface';
import { User } from './user.interface';

// Define and export all interfaces at once
export interface Odontograma {
    id?: number;
    pacienteId: number;
    evolucionId?: number;
    dentistaId: number;
    tipo?: 'adulto' | 'infantil';
    fecha: Date;
    observaciones?: string;
    piezas?: PiezaDental[];
    indices?: IndiceOdontologico[];
    paciente?: Patient;
    dentista?: User;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PiezaDental {
    id?: number;
    odontogramaId?: number;
    numeroPieza: number;
    estado: EstadoPieza;
    hallazgos?: Hallazgo[];
    tratamientos?: Tratamiento[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EstadoPieza {
    condicion: 'sano' | 'cariado' | 'obturado' | 'ausente' | 'corona' | 'endodoncia';
    movilidad: number;
    recesion: number;
    manchas?: boolean;
    placa?: boolean;
    calculos?: boolean;
}

export interface Hallazgo {
    tipo: string;
    ubicacion: string;
    descripcion?: string;
    fecha?: Date;
}

export interface Tratamiento {
    tipo: string;
    estado: 'pendiente' | 'en_proceso' | 'completado';
    fecha?: Date;
    notas?: string;
}

export interface IndiceOdontologico {
    id?: number;
    odontogramaId?: number;
    tipo: 'CPOD' | 'CPOS' | 'CEO' | 'Greene-Vermillion';
    valor: number;
    detalles?: {
        cariados?: number;
        perdidos?: number;
        obturados?: number;
        [key: string]: any;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OdontogramaResponse {
    success: boolean;
    data?: Odontograma;
    error?: string;
    message?: string;
}

export interface OdontogramasResponse {
    success: boolean;
    data?: Odontograma[];
    error?: string;
    message?: string;
}

export interface Especialidad {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}
