import type { EstadoReserva } from "@/types/reservas";

export const ESTADO_LABELS: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  sentada: "Sentada",
  finalizada: "Finalizada",
  no_asistio: "No asistió",
  lista_espera: "Lista de espera",
};

export const ESTADO_COLORS: Record<EstadoReserva, string> = {
  pendiente: "#f57c00",
  confirmada: "#388e3c",
  cancelada: "#d32f2f",
  sentada: "#7b1fa2",
  finalizada: "#616161",
  no_asistio: "#5d4037",
  lista_espera: "#f9a825",
};

export const ESTADO_BG_COLORS: Record<EstadoReserva, string> = {
  pendiente: "#fff3e0",
  confirmada: "#e8f5e9",
  cancelada: "#ffebee",
  sentada: "#f3e5f5",
  finalizada: "#f5f5f5",
  no_asistio: "#efebe9",
  lista_espera: "#fff8e1",
};
