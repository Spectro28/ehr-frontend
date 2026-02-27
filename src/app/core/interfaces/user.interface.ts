export interface User {
  id?: number;
  username: string;
  password?: string;
  role: string;
  especialidad?: string;
  active?: boolean;
  identificacion: string;
  tipo_identificacion: 'cedula' | 'pasaporte' | 'no_identificado';
  email: string;
  empresa: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  especialidad?: string;
  tipo_identificacion: 'cedula' | 'pasaporte' | 'no_identificado';
  identificacion?: string;
  email: string;
  empresa: string;
  roles?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
