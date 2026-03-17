"use client";

import { useState } from "react";
import CustomDatePicker from "@/components/CustomDatePicker";
import { listarReservas } from "@/api/reservas.api";
import {
  downloadExcelBest,
  generarRangoFechas,
} from "@/helpers/constants";
import { ESTADO_LABELS } from "../Consultar.constants";
import styles from "../Consultar.module.css";

interface ModalExportarExcelProps {
  fechaActual: string;
  onClose: () => void;
}

export default function ModalExportarExcel({
  fechaActual,
  onClose,
}: ModalExportarExcelProps) {
  const [modo, setModo] = useState<"dia" | "rango">("dia");
  const [desde, setDesde] = useState(fechaActual);
  const [hasta, setHasta] = useState(fechaActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validarRango = (): boolean => {
    if (modo === "dia") return true;

    if (!desde || !hasta) {
      setError("Selecciona ambas fechas");
      return false;
    }

    if (desde > hasta) {
      setError("La fecha 'Desde' debe ser anterior a 'Hasta'");
      return false;
    }

    const fechas = generarRangoFechas(desde, hasta);
    if (fechas.length > 31) {
      setError("El rango no puede superar 31 días");
      return false;
    }

    setError("");
    return true;
  };

  const handleDescargar = async () => {
    if (!validarRango()) return;

    setLoading(true);
    try {
      let todasReservas;

      if (modo === "dia") {
        todasReservas = await listarReservas({ fecha: fechaActual });
      } else {
        const fechas = generarRangoFechas(desde, hasta);
        const resultados = await Promise.all(
          fechas.map((fecha) => listarReservas({ fecha }))
        );
        todasReservas = resultados.flat();
      }

      // Map to Excel-friendly format
      const data = todasReservas.map((r) => ({
        Fecha: r.fecha,
        Hora: r.hora,
        Nombre: r.nombre,
        Teléfono: r.telefono,
        Correo: r.correo,
        Personas: r.personas,
        Zona: r.zona,
        Estado: ESTADO_LABELS[r.estado],
        Mesas: r.mesas.join(", ") || "—",
        Motivo: r.motivo || "",
        Notas: r.notas || "",
        Origen: r.origen || "",
      }));

      const filename =
        modo === "dia"
          ? `Reservas_${fechaActual}`
          : `Reservas_${desde}_a_${hasta}`;

      downloadExcelBest(data, filename);
      onClose();
    } catch {
      setError("Error al descargar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Exportar Excel</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="exportMode"
              checked={modo === "dia"}
              onChange={() => {
                setModo("dia");
                setError("");
              }}
            />
            Exportar día actual ({fechaActual})
          </label>

          <label className={styles.radioOption}>
            <input
              type="radio"
              name="exportMode"
              checked={modo === "rango"}
              onChange={() => {
                setModo("rango");
                setError("");
              }}
            />
            Exportar por rango de fechas
          </label>

          {modo === "rango" && (
            <div className={styles.dateRange}>
              <CustomDatePicker
                label="Desde"
                value={desde}
                onChange={(v) => {
                  setDesde(v);
                  setError("");
                }}
              />
              <CustomDatePicker
                label="Hasta"
                value={hasta}
                onChange={(v) => {
                  setHasta(v);
                  setError("");
                }}
              />
            </div>
          )}

          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnDownload}
            onClick={handleDescargar}
            disabled={loading}
          >
            {loading ? "Descargando..." : "📥 Descargar"}
          </button>
        </div>
      </div>
    </div>
  );
}
