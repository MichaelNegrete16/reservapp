"use client";

import type { Reserva } from "@/types/reservas";
import {
  ESTADO_LABELS,
  ESTADO_COLORS,
  ESTADO_BG_COLORS,
} from "../Consultar.constants";
import styles from "../Consultar.module.css";

interface TablaReservasProps {
  reservas: Reserva[];
  selectedId: string | null;
  onSelect: (reserva: Reserva) => void;
}

export default function TablaReservas({
  reservas,
  selectedId,
  onSelect,
}: TablaReservasProps) {
  // Sort by time ascending
  const sorted = [...reservas].sort((a, b) => a.hora.localeCompare(b.hora));

  if (sorted.length === 0) {
    return (
      <div className={styles.tablaWrapper} style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "#aaa", fontSize: 14 }}>
          No hay reservas para este día
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Nombre</th>
            <th>Personas</th>
            <th>Zona</th>
            <th>Estado</th>
            <th>Mesas</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const isSelected = r.id === selectedId;
            const isEspera = r.estado === "lista_espera";

            return (
              <tr
                key={r.id}
                onClick={() => onSelect(r)}
                className={[
                  isSelected ? styles.tablaRowSelected : "",
                  isEspera ? styles.tablaRowEspera : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <td style={{ fontWeight: 600 }}>{r.hora}</td>
                <td>{r.nombre}</td>
                <td>
                  <span className={styles.badgePersonas}>
                    👤 {r.personas}
                  </span>
                </td>
                <td>{r.zona}</td>
                <td>
                  <span
                    className={styles.estadoBadge}
                    style={{
                      color: ESTADO_COLORS[r.estado],
                      background: ESTADO_BG_COLORS[r.estado],
                    }}
                  >
                    {ESTADO_LABELS[r.estado]}
                  </span>
                  {isEspera && (
                    <span
                      className={styles.estadoBadge}
                      style={{
                        color: "#f57f17",
                        background: "#fff8e1",
                        marginLeft: 6,
                      }}
                    >
                      Lista de espera
                    </span>
                  )}
                </td>
                <td>{r.mesas.length > 0 ? r.mesas.join(", ") : "—"}</td>
                <td style={{ fontSize: 12, color: "#666" }}>{r.telefono}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
