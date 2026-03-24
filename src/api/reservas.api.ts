import type { Reserva } from "@/types/reservas";
import { api } from "@/lib/api-client";

// Calls POST /reservations/list
export async function listarReservas(params: {
  fecha: string;
}): Promise<Reserva[]> {
  const res = await api.post<{ ok: boolean; data: Reserva[]; total: number }>(
    "/reservations/list",
    { fecha: params.fecha, page: 1, limit: 100 }
  );
  return res.data;
}

// Hook-style wrapper (React Query pattern)
export function useListarReservasMutation() {
  return {
    mutateAsync: listarReservas,
  };
}
