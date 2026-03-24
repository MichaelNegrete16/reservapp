"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Lock, ChefHat, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api-client";
import styles from "./POS.module.css";

export type EstadoMesa = "libre" | "ocupada" | "cuenta-pendiente";

export interface Mesa {
  id: string;
  numero: number;
  zona: string;
  capacidad: number;
  estado: EstadoMesa;
  mesero?: string;
  personas?: number;
  horaApertura?: string;
  total?: number;
  orderId?: string;
}

const ESTADO_CONFIG: Record<EstadoMesa, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  libre:             { label: "Libre",            color: "#388e3c", bg: "#e8f5e9", icon: <UtensilsCrossed size={14} /> },
  ocupada:           { label: "Ocupada",           color: "#e65100", bg: "#fff3e0", icon: <ChefHat size={14} /> },
  "cuenta-pendiente":{ label: "Cuenta pendiente", color: "#c62828", bg: "#ffebee", icon: <Lock size={14} /> },
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

function calcularTiempo(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const now = new Date();
  const diff = (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m);
  if (diff < 0) return "--";
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

function mapStatus(apiStatus: string): EstadoMesa {
  switch (apiStatus) {
    case "open": return "ocupada";
    case "bill-requested": return "cuenta-pendiente";
    default: return "libre";
  }
}

export default function POSMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get<{ ok: boolean; data: Record<string, unknown>[] }>("/pos/tables");
      const mapped: Mesa[] = (res.data ?? []).map((t) => ({
        id: t.id as string,
        numero: (t.number as number) ?? (t.numero as number) ?? 0,
        zona: (t.zone as string) ?? (t.zona as string) ?? "Salón",
        capacidad: (t.capacity as number) ?? (t.capacidad as number) ?? 4,
        estado: mapStatus((t.status as string) ?? "libre"),
        mesero: (t.waiter as string) ?? (t.mesero as string) ?? undefined,
        personas: (t.people as number) ?? (t.personas as number) ?? undefined,
        horaApertura: (t.openedAt as string) ?? (t.horaApertura as string) ?? undefined,
        total: (t.total as number) ?? undefined,
        orderId: (t.orderId as string) ?? (t.activeOrderId as string) ?? undefined,
      }));
      setMesas(mapped);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando mesas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const libres   = mesas.filter((m) => m.estado === "libre").length;
  const ocupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const cuenta   = mesas.filter((m) => m.estado === "cuenta-pendiente").length;
  const ingresos = mesas.reduce((s, m) => s + (m.total ?? 0), 0);

  const zonas = [...new Set(mesas.map((m) => m.zona))];

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 60, textAlign: "center", color: "#999" }}>Cargando mesas...</div>
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
          <h1 className={styles.title}>Punto de Venta</h1>
          <p className={styles.subtitle}>Vista del mesero · Turno noche</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/pos/caja" className={styles.btnOutline}>
            🏦 Caja
          </Link>
          <Link href="/dashboard/pos/menu" className={styles.btnOutline}>
            📋 Gestionar Menú
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} style={{ background: "#e8f5e9" }}>🟢</span>
          <span className={styles.kpiLabel}>Mesas libres</span>
          <span className={styles.kpiValue} style={{ color: "#388e3c" }}>{libres}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} style={{ background: "#fff3e0" }}>🟠</span>
          <span className={styles.kpiLabel}>Mesas ocupadas</span>
          <span className={styles.kpiValue} style={{ color: "#e65100" }}>{ocupadas}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} style={{ background: "#ffebee" }}>🔴</span>
          <span className={styles.kpiLabel}>Cuenta pendiente</span>
          <span className={styles.kpiValue} style={{ color: "#c62828" }}>{cuenta}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon} style={{ background: "#f3e5f5" }}>💰</span>
          <span className={styles.kpiLabel}>Ingresos del turno</span>
          <span className={styles.kpiValue} style={{ color: "#6a1b9a", fontSize: 18 }}>{formatCOP(ingresos)}</span>
        </div>
      </div>

      {/* Mesas por zona */}
      {zonas.map((zona) => (
        <div key={zona} className={styles.zonaSection}>
          <h2 className={styles.zonaTitle}>📍 {zona}</h2>
          <div className={styles.mesasGrid}>
            {mesas.filter((m) => m.zona === zona).map((mesa) => {
              const cfg = ESTADO_CONFIG[mesa.estado];
              return (
                <div key={mesa.id} className={styles.mesaCard} style={{ borderTop: `4px solid ${cfg.color}` }}>
                  <div className={styles.mesaHeader}>
                    <span className={styles.mesaNumero}>Mesa {mesa.numero}</span>
                    <span className={styles.estadoBadge} style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className={styles.mesaCapacidad}>
                    👥 Capacidad: {mesa.capacidad} personas
                  </div>

                  {mesa.estado !== "libre" && (
                    <div className={styles.mesaInfo}>
                      <div className={styles.mesaInfoRow}>
                        <span>Mesero</span><span>{mesa.mesero}</span>
                      </div>
                      <div className={styles.mesaInfoRow}>
                        <span>Personas</span><span>{mesa.personas}</span>
                      </div>
                      {mesa.horaApertura && (
                        <div className={styles.mesaInfoRow}>
                          <span>Tiempo</span><span>{calcularTiempo(mesa.horaApertura)}</span>
                        </div>
                      )}
                      <div className={styles.mesaInfoRow}>
                        <span>Total acum.</span>
                        <span className={styles.mesaTotal}>{formatCOP(mesa.total ?? 0)}</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.mesaActions}>
                    {mesa.estado === "libre" && (
                      <Link href={`/dashboard/pos/mesa/${mesa.id}`} className={styles.btnAbrir}>
                        <ShoppingCart size={15} /> Abrir mesa
                      </Link>
                    )}
                    {mesa.estado === "ocupada" && (
                      <Link href={`/dashboard/pos/mesa/${mesa.id}`} className={styles.btnVerOrden}>
                        Ver orden
                      </Link>
                    )}
                    {mesa.estado === "cuenta-pendiente" && (
                      <Link href={`/dashboard/pos/factura/${mesa.id}`} className={styles.btnCobrar}>
                        💳 Cobrar
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
