"use client";

import { useState } from "react";
import styles from "./Caja.module.css";

/* ─── Datos mock ─── */
const TRANSACCIONES = [
  { id: "T001", hora: "18:45", mesa: "Mesa 3",  mesero: "Laura M.",  items: 6, metodo: "Tarjeta",      total: 142000 },
  { id: "T002", hora: "19:10", mesa: "Mesa 1",  mesero: "Carlos R.", items: 3, metodo: "Efectivo",     total: 87500  },
  { id: "T003", hora: "19:30", mesa: "Mesa 9",  mesero: "Jhon P.",   items: 5, metodo: "Transferencia",total: 176000 },
  { id: "T004", hora: "19:55", mesa: "Mesa 4",  mesero: "Carlos R.", items: 8, metodo: "Tarjeta",      total: 215000 },
  { id: "T005", hora: "20:10", mesa: "Mesa 7",  mesero: "Laura M.",  items: 2, metodo: "Efectivo",     total: 54000  },
  { id: "T006", hora: "20:30", mesa: "Barra 11",mesero: "Jhon P.",   items: 1, metodo: "Efectivo",     total: 28000  },
  { id: "T007", hora: "20:45", mesa: "Mesa 12", mesero: "Carlos R.", items: 4, metodo: "Tarjeta",      total: 98000  },
  { id: "T008", hora: "21:00", mesa: "Mesa 5",  mesero: "Laura M.",  items: 3, metodo: "Tarjeta",      total: 61000  },
  { id: "T009", hora: "21:20", mesa: "Mesa 2",  mesero: "Jhon P.",   items: 2, metodo: "Efectivo",     total: 36000  },
  { id: "T010", hora: "21:40", mesa: "Mesa 8",  mesero: "Carlos R.", items: 5, metodo: "Transferencia",total: 124000 },
];

const METODO_COLOR: Record<string, { color: string; bg: string }> = {
  Efectivo:      { color: "#388e3c", bg: "#e8f5e9" },
  Tarjeta:       { color: "#1565c0", bg: "#e3f2fd" },
  Transferencia: { color: "#6a1b9a", bg: "#f3e5f5" },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function CajaPage() {
  const [modalCierre, setModalCierre] = useState(false);
  const [cajaCerrada, setCajaCerrada] = useState(false);

  const totalVentas  = TRANSACCIONES.reduce((s, t) => s + t.total, 0);
  const totalEfectivo    = TRANSACCIONES.filter((t) => t.metodo === "Efectivo").reduce((s, t) => s + t.total, 0);
  const totalTarjeta     = TRANSACCIONES.filter((t) => t.metodo === "Tarjeta").reduce((s, t) => s + t.total, 0);
  const totalTransferencia = TRANSACCIONES.filter((t) => t.metodo === "Transferencia").reduce((s, t) => s + t.total, 0);
  const numTransacciones = TRANSACCIONES.length;

  const pctEfectivo     = Math.round((totalEfectivo / totalVentas) * 100);
  const pctTarjeta      = Math.round((totalTarjeta / totalVentas) * 100);
  const pctTransferencia = 100 - pctEfectivo - pctTarjeta;

  const gradientDonut = `conic-gradient(
    #388e3c 0% ${pctEfectivo}%,
    #1565c0 ${pctEfectivo}% ${pctEfectivo + pctTarjeta}%,
    #6a1b9a ${pctEfectivo + pctTarjeta}% 100%
  )`;

  if (cajaCerrada) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h2>Caja cerrada correctamente</h2>
          <p>Turno noche · {new Date().toLocaleDateString("es-CO", { dateStyle: "full" })}</p>
          <div className={styles.successTotal}>{formatCOP(totalVentas)}</div>
          <p className={styles.successSub}>{numTransacciones} transacciones procesadas</p>
          <a href="/dashboard/pos" className={styles.btnVolver}>Volver a mesas</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cierre de Caja</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString("es-CO", { dateStyle: "full" })} · Turno noche
          </p>
        </div>
        <div className={styles.headerActions}>
          <a href="/dashboard/pos" className={styles.btnVolver}>← Volver a mesas</a>
          <button className={styles.btnCerrar} onClick={() => setModalCierre(true)}>
            🔒 Cerrar Caja
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard} style={{ borderTop: "4px solid #e65100" }}>
          <span className={styles.kpiLabel}>Ventas del turno</span>
          <span className={styles.kpiValue}>{formatCOP(totalVentas)}</span>
          <span className={styles.kpiSub}>{numTransacciones} transacciones</span>
        </div>
        <div className={styles.kpiCard} style={{ borderTop: "4px solid #388e3c" }}>
          <span className={styles.kpiLabel}>💵 Efectivo</span>
          <span className={styles.kpiValue} style={{ color: "#388e3c" }}>{formatCOP(totalEfectivo)}</span>
          <span className={styles.kpiSub}>{pctEfectivo}% del total</span>
        </div>
        <div className={styles.kpiCard} style={{ borderTop: "4px solid #1565c0" }}>
          <span className={styles.kpiLabel}>💳 Tarjeta</span>
          <span className={styles.kpiValue} style={{ color: "#1565c0" }}>{formatCOP(totalTarjeta)}</span>
          <span className={styles.kpiSub}>{pctTarjeta}% del total</span>
        </div>
        <div className={styles.kpiCard} style={{ borderTop: "4px solid #6a1b9a" }}>
          <span className={styles.kpiLabel}>📲 Transferencia</span>
          <span className={styles.kpiValue} style={{ color: "#6a1b9a" }}>{formatCOP(totalTransferencia)}</span>
          <span className={styles.kpiSub}>{pctTransferencia}% del total</span>
        </div>
      </div>

      {/* Cuerpo: tabla + donut */}
      <div className={styles.midRow}>
        {/* Historial */}
        <div className={styles.tablaCard}>
          <h3 className={styles.cardTitle}>Historial de transacciones</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Hora</th>
                <th>Mesa</th>
                <th>Mesero</th>
                <th>Items</th>
                <th>Método</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACCIONES.map((t) => {
                const mc = METODO_COLOR[t.metodo];
                return (
                  <tr key={t.id}>
                    <td className={styles.tdId}>{t.id}</td>
                    <td>{t.hora}</td>
                    <td>{t.mesa}</td>
                    <td>{t.mesero}</td>
                    <td className={styles.tdCenter}>{t.items}</td>
                    <td>
                      <span className={styles.metodoBadge} style={{ color: mc.color, background: mc.bg }}>
                        {t.metodo}
                      </span>
                    </td>
                    <td className={styles.tdTotal}>{formatCOP(t.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Donut */}
        <div className={styles.donutCard}>
          <h3 className={styles.cardTitle}>Distribución por método</h3>
          <div className={styles.donut} style={{ background: gradientDonut }}>
            <div className={styles.donutCenter}>
              <span className={styles.donutTotal}>{formatCOP(totalVentas)}</span>
              <span className={styles.donutLabel}>Total</span>
            </div>
          </div>
          <div className={styles.leyenda}>
            <div className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ background: "#388e3c" }} />
              <span>Efectivo</span>
              <span className={styles.leyendaPct}>{pctEfectivo}%</span>
            </div>
            <div className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ background: "#1565c0" }} />
              <span>Tarjeta</span>
              <span className={styles.leyendaPct}>{pctTarjeta}%</span>
            </div>
            <div className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ background: "#6a1b9a" }} />
              <span>Transferencia</span>
              <span className={styles.leyendaPct}>{pctTransferencia}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cierre */}
      {modalCierre && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>¿Cerrar caja?</h3>
            <p className={styles.modalDesc}>
              Se registrarán <strong>{numTransacciones} transacciones</strong> por un total de{" "}
              <strong>{formatCOP(totalVentas)}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className={styles.modalBtns}>
              <button className={styles.btnCancelar} onClick={() => setModalCierre(false)}>
                Cancelar
              </button>
              <button
                className={styles.btnConfirmar}
                onClick={() => { setModalCierre(false); setCajaCerrada(true); }}
              >
                Sí, cerrar caja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
