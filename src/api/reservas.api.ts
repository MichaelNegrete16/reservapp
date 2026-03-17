import type { Reserva, EstadoReserva } from "@/types/reservas";

// Mock data generator
function generarReservasMock(fecha: string): Reserva[] {
  const nombres = [
    "Carlos García",
    "María López",
    "Juan Rodríguez",
    "Ana Martínez",
    "Pedro Sánchez",
    "Laura Fernández",
    "Diego Torres",
    "Camila Ruiz",
    "Andrés Morales",
    "Valentina Díaz",
    "Santiago Herrera",
    "Isabella Gómez",
  ];

  const zonas = ["Terraza", "Salón principal", "Barra", "VIP"];
  const estados: EstadoReserva[] = [
    "pendiente",
    "confirmada",
    "sentada",
    "finalizada",
    "cancelada",
    "no_asistio",
    "lista_espera",
  ];
  const horas = [
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
  ];

  // Use fecha as seed for consistent data
  const seed = fecha
    .split("-")
    .reduce((acc, n) => acc + parseInt(n), 0);
  const count = 8 + (seed % 5);

  return Array.from({ length: count }, (_, i) => {
    const idx = (seed + i) % nombres.length;
    const estadoIdx = i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : (seed + i) % estados.length;
    return {
      id: `${fecha}-${i + 1}`,
      fecha,
      hora: horas[(seed + i) % horas.length],
      nombre: nombres[idx],
      telefono: `+57 3${String(100000000 + idx * 11111111).slice(0, 9)}`,
      correo: `${nombres[idx].split(" ")[0].toLowerCase()}@email.com`,
      personas: 1 + ((seed + i) % 8),
      zona: zonas[(seed + i) % zonas.length],
      estado: estados[estadoIdx],
      mesas: estadoIdx >= 2 ? [`M${(i % 12) + 1}`] : [],
      motivo: ["Cena casual", "Cumpleaños", "Negocios", "Aniversario"][i % 4],
      notas: i % 3 === 0 ? "Cliente frecuente" : undefined,
      origen: ["Web", "Teléfono", "Widget"][i % 3],
    };
  });
}

// Simulates POST /reservas/listar
export async function listarReservas(params: {
  fecha: string;
}): Promise<Reserva[]> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
  return generarReservasMock(params.fecha);
}

// Hook-style wrapper (React Query pattern)
export function useListarReservasMutation() {
  return {
    mutateAsync: listarReservas,
  };
}
