import * as XLSX from "xlsx";

export function downloadExcelBest(
  data: Record<string, unknown>[],
  filename: string
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reservas");

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? "").length)
    ),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function formatFecha(fecha: string): string {
  const date = new Date(fecha + "T12:00:00");
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generarRangoFechas(desde: string, hasta: string): string[] {
  const fechas: string[] = [];
  const current = new Date(desde + "T12:00:00");
  const end = new Date(hasta + "T12:00:00");

  while (current <= end) {
    fechas.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return fechas;
}
