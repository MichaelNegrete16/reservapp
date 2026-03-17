export type EstadoReserva =
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "sentada"
  | "finalizada"
  | "no_asistio"
  | "lista_espera";

export interface Reserva {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  nombre: string;
  telefono: string;
  correo: string;
  personas: number;
  zona: string;
  estado: EstadoReserva;
  mesas: string[];
  motivo?: string;
  notas?: string;
  origen?: string;
  tipo_documento?: string;
  numero_documento?: string;
}
