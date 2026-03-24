"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import styles from "./Caja.module.css";

interface Transaccion {
  id: string;
  hora: string;
  mesa: string;
  mesero: string;
  items: number;
  metodo: string;
  total: number;
}

const METODO_COLOR: Record<string, { color: string; bg: string }> = {
  Efectivo:      { color: "#388e3c", bg: "#e8f5e9" },
  efectivo:      { color: "#388e3c", bg: "#e8f5e9" },
  Tarjeta:       { color: "#1565c0", bg: "#e3f2fd" },
  tarjeta:       { color: "#1565c0", bg: "#e3f2fd" },
  Transferencia: { color: "#6a1b9a", bg: "#f3e5f5" },
  transferencia: { color: "#6a1b9a", bg: "#f3e5f5" },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function CajaPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [summary, setSummary] = useState<{
    totalVentas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
    numTransacciones: number;
  }>({ totalVentas: 0, totalEfectivo: 0, totalTarjeta: 0, totalTransferencia: 0, numTransacciones: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalCierre, setModalCierre] = useState(false);
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, txRes] = await Promise.all([
        api.get<{ ok: boolean; data: Record<string, unknown> }>("/pos/register/summary"),
        api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/pos/register/transactions"),
      ]);

      // Map summary
      const s = summaryRes.data;
      setSummary({
        totalVentas: (s.totalSales as number) ?? (s.totalVentas as number) ?? 0,
        totalEfectivo: (s.totalCash as number) ?? (s.totalEfectivo as number) ?? 0,
        totalTarjeta: (s.totalCard as number) ?? (s.totalTarjeta as number) ?? 0,
        totalTransferencia: (s.totalTransfer as number) ?? (s.totalTransferencia as number) ?? 0,
        numTransacciones: (s.transactionCount as number) ?? (s.numTransacciones as number) ?? 0,
      });

      // Map transactions
      const mapped: Transaccion[] = (txRes.data ?? []).map((t) => ({
        id: (t.id as string) ?? "",
        hora: (t.time as string) ?? (t.hora as string) ?? "",
        mesa: (t.table as string) ?? (t.mesa as string) ?? "",
        mesero: (t.waiter as string) ?? (t.mesero as string) ?? "",
        items: (t.itemCount as number) ?? (t.items as number) ?? 0,
        metodo: (t.paymentMethod as string) ?? (t.metodo as string) ?? "",
        total: (t.total as number) ?? 0,
      }));
      setTransacciones(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos de caja");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCerrarCaja = async () => {
    try {
      setClosing(true);
      await api.post("/pos/register/close");
      setModalCierre(false);
      setCajaCerrada(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error cerrando caja");
    } finally {
      setClosing(false);
    }
  };

  const { totalVentas, totalEfectivo, totalTarjeta, totalTransferencia, numTransacciones } = summary;

  const pctEfectivo     = totalVentas > 0 ? Math.round((totalEfectivo / totalVentas) * 100) : 0;
  const pctTarjeta      = totalVentas > 0 ? Math.round((totalTarjeta / totalVentas) * 100) : 0;
  const pctTransferencia = totalVentas > 0 ? 100 - pctEfectivo - pctTarjeta : 0;

  const gradientDonut = totalVentas > 0
    ? `conic-gradient(
      #388e3c 0% ${pctEfectivo}%,
      #1565c0 ${pctEfectivo}% ${pctEfectivo + pctTarjeta}%,
      #6a1b9a ${pctEfectivo + pctTarjeta}% 100%
    )`
    : `conic-gradient(#e0e0e0 0% 100%)`;

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

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#999" }}>Cargando datos de caja...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#d32f2f" }}>{error}</div>
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
              {transacciones.map((t) => {
                const mc = METODO_COLOR[t.metodo] ?? { color: "#555", bg: "#f0f0f0" };
                return (
                  <tr key={t.id}>
                    <td className={styles.tdId}>{t.id.slice(0, 6)}</td>
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
                onClick={handleCerrarCaja}
                disabled={closing}
              >
                {closing ? "Cerrando..." : "Sí, cerrar caja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
