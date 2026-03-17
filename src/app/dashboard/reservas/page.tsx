"use client";

import { useState, useEffect, useCallback } from "react";
import type { Reserva, EstadoReserva } from "@/types/reservas";
import { listarReservas } from "@/api/reservas.api";
import { formatFecha } from "@/helpers/constants";
import {
  ESTADO_LABELS,
  ESTADO_COLORS,
  ESTADO_BG_COLORS,
} from "./Consultar.constants";
import TablaReservas from "./components/TablaReservas";
import ModalExportarExcel from "./components/ModalExportarExcel";
import CustomDatePicker from "@/components/CustomDatePicker";
import styles from "./Consultar.module.css";

type Vista = "flujo" | "listado";

const GRUPOS_ESTADO: { estado: EstadoReserva; emoji: string }[] = [
  { estado: "pendiente", emoji: "🟠" },
  { estado: "confirmada", emoji: "🟢" },
  { estado: "sentada", emoji: "🟣" },
  { estado: "finalizada", emoji: "⚫" },
];

export default function ConsultarReservas() {
  const hoy = new Date().toISOString().split("T")[0];

  const [vista, setVista] = useState<Vista>("flujo");
  const [fecha, setFecha] = useState(hoy);
  const [zonaFiltro, setZonaFiltro] = useState("");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [selected, setSelected] = useState<Reserva | null>(null);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarReservas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarReservas({ fecha });
      setReservas(data);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  // Apply zone filter
  const reservasFiltradas = zonaFiltro
    ? reservas.filter((r) => r.zona === zonaFiltro)
    : reservas;

  // Get unique zones for filter
  const zonas = [...new Set(reservas.map((r) => r.zona))];

  // Group by estado for flujo view
  const reservasPorEstado = (estado: EstadoReserva) =>
    reservasFiltradas.filter((r) => r.estado === estado);

  const reservasEspera = reservasFiltradas.filter(
    (r) => r.estado === "lista_espera"
  );

  // KPIs
  const totalReservas = reservasFiltradas.length;
  const totalPersonas = reservasFiltradas.reduce(
    (acc, r) => acc + r.personas,
    0
  );
  const confirmadas = reservasFiltradas.filter(
    (r) => r.estado === "confirmada"
  ).length;
  const pendientes = reservasFiltradas.filter(
    (r) => r.estado === "pendiente"
  ).length;

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1 className={styles.title}>Reservas</h1>
          <p className={styles.subtitle}>{formatFecha(fecha)}</p>
        </div>

        <div className={styles.topBarRight}>
          <CustomDatePicker value={fecha} onChange={setFecha} />

          <select
            className={styles.filterSelect}
            value={zonaFiltro}
            onChange={(e) => setZonaFiltro(e.target.value)}
          >
            <option value="">Todas las zonas</option>
            {zonas.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* View Tabs */}
          <div className={styles.viewTabs}>
            <button
              className={`${styles.viewTab} ${
                vista === "flujo" ? styles.viewTabActive : ""
              }`}
              onClick={() => setVista("flujo")}
            >
              Flujo operativo
            </button>
            <button
              className={`${styles.viewTab} ${
                vista === "listado" ? styles.viewTabActive : ""
              }`}
              onClick={() => setVista("listado")}
            >
              Listado general
            </button>
          </div>

          <button
            className={styles.btnExcel}
            onClick={() => setShowExcelModal(true)}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard} data-color="blue">
          <div className={styles.kpiLabel}>Total reservas hoy</div>
          <div className={styles.kpiValue}>{totalReservas}</div>
        </div>
        <div className={styles.kpiCard} data-color="purple">
          <div className={styles.kpiLabel}>Personas esperadas</div>
          <div className={styles.kpiValue}>{totalPersonas}</div>
        </div>
        <div className={styles.kpiCard} data-color="green">
          <div className={styles.kpiLabel}>Confirmadas</div>
          <div className={styles.kpiValue}>{confirmadas}</div>
        </div>
        <div className={styles.kpiCard} data-color="orange">
          <div className={styles.kpiLabel}>Pendientes</div>
          <div className={styles.kpiValue}>{pendientes}</div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          Cargando reservas...
        </div>
      )}

      {/* Vista: Flujo Operativo */}
      {!loading && vista === "flujo" && (
        <div className={styles.flujoLayout}>
          {/* Left Column — Reservation List */}
          <div className={styles.listaReservas}>
            {GRUPOS_ESTADO.map(({ estado, emoji }) => {
              const grupo = reservasPorEstado(estado);
              if (grupo.length === 0) return null;

              return (
                <div key={estado} className={styles.grupoEstado}>
                  <div className={styles.grupoTitulo}>
                    <span
                      className={styles.grupoDot}
                      style={{ background: ESTADO_COLORS[estado] }}
                    />
                    {emoji} {ESTADO_LABELS[estado]} ({grupo.length})
                  </div>

                  {grupo.map((r) => (
                    <div
                      key={r.id}
                      className={`${styles.reservaCard} ${
                        selected?.id === r.id
                          ? styles.reservaCardSelected
                          : ""
                      }`}
                      onClick={() => setSelected(r)}
                    >
                      <div className={styles.reservaCardTop}>
                        <span className={styles.reservaNombre}>
                          {r.nombre}
                        </span>
                        <span className={styles.badgePersonas}>
                          👤 {r.personas}
                        </span>
                      </div>
                      <div className={styles.reservaInfo}>
                        {r.hora} · {r.zona}
                        {r.mesas.length > 0 && ` · ${r.mesas.join(", ")}`}
                      </div>

                      {/* Action buttons by estado */}
                      <div className={styles.reservaAcciones}>
                        {estado === "pendiente" && (
                          <>
                            <button
                              className={`${styles.btnAccion} ${styles.btnAccionPrimary}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Confirmar
                            </button>
                            <button
                              className={`${styles.btnAccion} ${styles.btnAccionOutline}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {estado === "confirmada" && (
                          <>
                            <button
                              className={`${styles.btnAccion} ${styles.btnAccionOutline}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Sentar
                            </button>
                            <button
                              className={`${styles.btnAccion} ${styles.btnAccionOutline}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              No asistió
                            </button>
                            <button
                              className={`${styles.btnAccion} ${styles.btnAccionOutline}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {estado === "sentada" && (
                          <button
                            className={`${styles.btnAccion} ${styles.btnAccionOutline}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Finalizar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Lista de espera */}
            {reservasEspera.length > 0 && (
              <div className={styles.listaEspera}>
                <div className={styles.listaEsperaTitulo}>
                  ⏳ Lista de espera ({reservasEspera.length})
                </div>
                {reservasEspera.map((r) => (
                  <div
                    key={r.id}
                    className={`${styles.reservaCard} ${
                      selected?.id === r.id
                        ? styles.reservaCardSelected
                        : ""
                    }`}
                    onClick={() => setSelected(r)}
                    style={{ background: "transparent", border: "1px solid #ffe082" }}
                  >
                    <div className={styles.reservaCardTop}>
                      <span className={styles.reservaNombre}>{r.nombre}</span>
                      <span className={styles.badgePersonas}>
                        👤 {r.personas}
                      </span>
                    </div>
                    <div className={styles.reservaInfo}>
                      {r.hora} · {r.zona}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Detail Panel */}
            {selected && <DetailPanel reserva={selected} />}
          </div>

          {/* Right Column — Floor Plan Placeholder */}
          <div className={styles.floorPlan}>
            <div className={styles.floorPlanPlaceholder}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <p>Plano interactivo de mesas</p>
              <p style={{ fontSize: 12 }}>
                Selecciona una reserva para asignar mesas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Listado General */}
      {!loading && vista === "listado" && (
        <div>
          <TablaReservas
            reservas={reservasFiltradas}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />

          {selected && (
            <div className={styles.detailPanelCentered}>
              <DetailPanel reserva={selected} />
            </div>
          )}
        </div>
      )}

      {/* Modal Exportar Excel */}
      {showExcelModal && (
        <ModalExportarExcel
          fechaActual={fecha}
          onClose={() => setShowExcelModal(false)}
        />
      )}
    </div>
  );
}

// Detail Panel sub-component
function DetailPanel({ reserva }: { reserva: Reserva }) {
  return (
    <div className={styles.detailPanel}>
      <h4 className={styles.detailTitle}>Detalle de reserva</h4>
      <div className={styles.detailGrid}>
        <DetailItem label="Nombre" value={reserva.nombre} />
        <DetailItem label="Teléfono" value={reserva.telefono} />
        <DetailItem label="Correo" value={reserva.correo} />
        <DetailItem label="Fecha" value={reserva.fecha} />
        <DetailItem label="Hora" value={reserva.hora} />
        <DetailItem label="Personas" value={String(reserva.personas)} />
        <DetailItem label="Zona" value={reserva.zona} />
        <DetailItem
          label="Estado"
          value={ESTADO_LABELS[reserva.estado]}
          color={ESTADO_COLORS[reserva.estado]}
          bgColor={ESTADO_BG_COLORS[reserva.estado]}
        />
        <DetailItem
          label="Mesas"
          value={reserva.mesas.join(", ") || "Sin asignar"}
        />
        <DetailItem label="Motivo" value={reserva.motivo || "—"} />
        <DetailItem label="Notas" value={reserva.notas || "—"} />
        <DetailItem label="Origen" value={reserva.origen || "—"} />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      {color ? (
        <span
          className={styles.estadoBadge}
          style={{ color, background: bgColor }}
        >
          {value}
        </span>
      ) : (
        <span className={styles.detailValue}>{value}</span>
      )}
    </div>
  );
}
