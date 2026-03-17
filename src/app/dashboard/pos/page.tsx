"use client";

import Link from "next/link";
import { ShoppingCart, Lock, ChefHat, UtensilsCrossed } from "lucide-react";
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
}

const MESAS: Mesa[] = [
  { id: "1",  numero: 1,  zona: "Salón",   capacidad: 4, estado: "ocupada",          mesero: "Carlos R.", personas: 3, horaApertura: "19:15", total: 87500 },
  { id: "2",  numero: 2,  zona: "Salón",   capacidad: 2, estado: "libre" },
  { id: "3",  numero: 3,  zona: "Salón",   capacidad: 4, estado: "cuenta-pendiente", mesero: "Laura M.",  personas: 4, horaApertura: "18:30", total: 142000 },
  { id: "4",  numero: 4,  zona: "Salón",   capacidad: 6, estado: "ocupada",          mesero: "Carlos R.", personas: 5, horaApertura: "19:00", total: 215000 },
  { id: "5",  numero: 5,  zona: "Salón",   capacidad: 2, estado: "libre" },
  { id: "6",  numero: 6,  zona: "Salón",   capacidad: 4, estado: "libre" },
  { id: "7",  numero: 7,  zona: "Terraza", capacidad: 4, estado: "ocupada",          mesero: "Laura M.",  personas: 2, horaApertura: "19:30", total: 54000 },
  { id: "8",  numero: 8,  zona: "Terraza", capacidad: 6, estado: "libre" },
  { id: "9",  numero: 9,  zona: "Terraza", capacidad: 4, estado: "ocupada",          mesero: "Jhon P.",   personas: 4, horaApertura: "18:45", total: 176000 },
  { id: "10", numero: 10, zona: "Terraza", capacidad: 2, estado: "libre" },
  { id: "11", numero: 11, zona: "Barra",   capacidad: 2, estado: "ocupada",          mesero: "Jhon P.",   personas: 1, horaApertura: "20:00", total: 28000 },
  { id: "12", numero: 12, zona: "Barra",   capacidad: 4, estado: "cuenta-pendiente", mesero: "Carlos R.", personas: 3, horaApertura: "18:00", total: 98000 },
];

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
  if (diff < 0) return "—";
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

export default function POSMesas() {
  const libres   = MESAS.filter((m) => m.estado === "libre").length;
  const ocupadas = MESAS.filter((m) => m.estado === "ocupada").length;
  const cuenta   = MESAS.filter((m) => m.estado === "cuenta-pendiente").length;
  const ingresos = MESAS.reduce((s, m) => s + (m.total ?? 0), 0);

  const zonas = [...new Set(MESAS.map((m) => m.zona))];

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
            {MESAS.filter((m) => m.zona === zona).map((mesa) => {
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
                      <div className={styles.mesaInfoRow}>
                        <span>Tiempo</span><span>{calcularTiempo(mesa.horaApertura!)}</span>
                      </div>
                      <div className={styles.mesaInfoRow}>
                        <span>Total acum.</span>
                        <span className={styles.mesaTotal}>{formatCOP(mesa.total!)}</span>
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
