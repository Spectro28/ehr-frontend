export interface PiezaDental {
  numeroPieza: number;
  estado: EstadoPieza;
}

export interface EstadoPieza {
  condicion: 'sano' | 'cariado' | 'obturado' | 'ausente' | 'corona' | 'endodoncia';
  movilidad: boolean;
  recesion: boolean;
  manchas: boolean;
  placa: boolean;
  calculos: boolean;
}
