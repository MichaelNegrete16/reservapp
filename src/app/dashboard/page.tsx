"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { getMe, type AuthUser } from "@/lib/auth";
import styles from "./Dashboard.module.css";

interface Reserva {
  id: string;
  hora: string;
  nombre: string;
  personas: number;
  zona?: string;
  zoneName?: string;
  estado: string;
  mesas?: number[];
}

interface Zone {
  id: string;
  name: string;
  capacity: number;
  active: boolean;
}

interface KpiData {
  total: number;
  confirmadas: number;
  pendientes: number;
  personas: number;
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "PENDIENTE",
  confirmada: "CONFIRMADO",
  sentada: "LLEGÓ",
  finalizada: "FINALIZADA",
  cancelada: "CANCELADA",
  no_asistio: "NO ASISTIÓ",
  lista_espera: "LISTA ESPERA",
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "#e65100",
  confirmada: "#1565c0",
  sentada: "#388e3c",
  finalizada: "#616161",
  cancelada: "#d32f2f",
  no_asistio: "#5d4037",
  lista_espera: "#f9a825",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [kpis, setKpis] = useState<KpiData>({ total: 0, confirmadas: 0, pendientes: 0, personas: 0 });
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [me, kpiRes, resRes, zonesRes] = await Promise.all([
          getMe(),
          api.get<{ ok: boolean; data: KpiData }>(`/reservations/kpis?date=${today()}`),
          api.post<{ ok: boolean; data: Reserva[] }>("/reservations/list", { fecha: today(), page: 1, limit: 20 }),
          api.get<{ ok: boolean; data: Zone[] }>("/zones"),
        ]);
        setUser(me);
        setKpis(kpiRes.data);
        setReservas(resRes.data ?? []);
        setZones(zonesRes.data ?? []);
      } catch {
        // silently fail — user may see empty state
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build KPI cards from real data
  const kpiCards = [
    { label: "Reservas hoy", value: String(kpis.total), color: "#e65100" },
    { label: "Personas esperadas", value: String(kpis.personas), color: "#1565c0" },
    { label: "Confirmadas", value: String(kpis.confirmadas), color: "#388e3c" },
    { label: "Pendientes", value: String(kpis.pendientes), color: "#6a1b9a" },
  ];

  // Build hours distribution from reservas
  const hourCounts: Record<string, number> = {};
  reservas.forEach((r) => {
    const h = r.hora?.slice(0, 2) ?? "00";
    const label = `${Number(h) > 12 ? Number(h) - 12 : Number(h)}${Number(h) >= 12 ? "pm" : "am"}`;
    hourCounts[label] = (hourCounts[label] ?? 0) + 1;
  });
  const hoursData = Object.entries(hourCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const maxBar = Math.max(...hoursData.map((d) => d.value), 1);

  // Upcoming: sort by hora, take first 5 non-finalized
  const upcoming = reservas
    .filter((r) => ["pendiente", "confirmada", "sentada"].includes(r.estado))
    .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""))
    .slice(0, 5);

  // Occupancy by zone: count reservas per zone
  const activeZones = zones.filter((z) => z.active);
  const zoneOccupancy = activeZones.map((z) => {
    const zonReservas = reservas.filter(
      (r) => (r.zona === z.name || r.zoneName === z.name) && ["confirmada", "sentada"].includes(r.estado)
    );
    const personasEnZona = zonReservas.reduce((s, r) => s + (r.personas ?? 0), 0);
    const pct = z.capacity > 0 ? Math.min(100, Math.round((personasEnZona / z.capacity) * 100)) : 0;
    return { name: z.name, pct, personas: personasEnZona, capacity: z.capacity };
  });
  const totalCapacity = activeZones.reduce((s, z) => s + z.capacity, 0);
  const totalOccupied = zoneOccupancy.reduce((s, z) => s + z.personas, 0);
  const overallPct = totalCapacity > 0 ? Math.min(100, Math.round((totalOccupied / totalCapacity) * 100)) : 0;

  if (loading) {
    return (
      <div className={styles.page} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, {user?.name?.split(" ")[0] ?? "Usuario"}</h1>
          <p className={styles.subGreeting}>
            Esto es lo que está pasando hoy en{" "}
            <span className={styles.restaurantName}>{user?.restaurant?.name ?? "tu restaurante"}</span>
          </p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnOutline}>
            <Download size={16} /> Exportar
          </button>
          <Link href="/dashboard/reservas/nueva" className={styles.btnPrimary}>
            <Plus size={16} /> Nueva reserva
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        {kpiCards.map(({ label, value, color }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiBar} style={{ background: color }} />
            <span className={styles.kpiLabel}>{label}</span>
            <div className={styles.kpiRow}>
              <span className={styles.kpiValue}>{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Reservas por hora</h3>
              <p className={styles.chartSubtitle}>
                Distribución de reservas de hoy
              </p>
            </div>
          </div>
          <div className={styles.barChart}>
            {hoursData.length > 0 ? (
              hoursData.map(({ label, value }) => (
                <div key={label} className={styles.barCol}>
                  <span className={styles.barLabel}>{label}</span>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(value / maxBar) * 200}px`,
                      background:
                        value === maxBar
                          ? "linear-gradient(180deg, #c2185b, #e91e63)"
                          : "#f3e5f5",
                    }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
                Sin reservas para hoy
              </p>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className={styles.upcomingCard}>
          <h3 className={styles.chartTitle}>Próximas reservas</h3>
          <div className={styles.upcomingList}>
            {upcoming.length > 0 ? (
              upcoming.map((r) => (
                <div key={r.id} className={styles.upcomingItem}>
                  <span className={styles.upcomingTime}>{r.hora}</span>
                  <div className={styles.upcomingInfo}>
                    <span className={styles.upcomingName}>{r.nombre}</span>
                    <span className={styles.upcomingMeta}>
                      {r.personas} personas{r.mesas && r.mesas.length > 0 ? ` · Mesa ${r.mesas.join(", ")}` : ""}
                    </span>
                  </div>
                  <span
                    className={styles.upcomingStatus}
                    style={{
                      color: ESTADO_COLORS[r.estado] ?? "#888",
                      background: `${ESTADO_COLORS[r.estado] ?? "#888"}15`,
                    }}
                  >
                    {ESTADO_LABELS[r.estado] ?? r.estado}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#999", textAlign: "center", padding: "40px 0" }}>
                No hay reservas próximas
              </p>
            )}
          </div>
          <Link href="/dashboard/reservas" className={styles.viewAllBtn}>
            Ver todas las reservas
          </Link>
        </div>
      </div>

      {/* Occupancy */}
      <div className={styles.occupancyCard}>
        <div className={styles.occupancyHeader}>
          <div>
            <h3 className={styles.chartTitle}>Ocupación actual del local</h3>
            <p className={styles.chartSubtitle}>
              Estado de capacidad en tiempo real por zona
            </p>
          </div>
          <div className={styles.occupancyTotal}>
            <span className={styles.occupancyPct}>{overallPct}%</span>
            <span className={styles.occupancySeats}>{totalOccupied} / {totalCapacity} personas</span>
          </div>
        </div>
        <div className={styles.occupancyBarBg}>
          <div className={styles.occupancyBarFill} style={{ width: `${overallPct}%` }} />
        </div>
        <div className={styles.zonesRow}>
          {zoneOccupancy.length > 0 ? (
            zoneOccupancy.map(({ name, pct }) => (
              <div key={name} className={styles.zoneItem}>
                <div className={styles.zoneInfo}>
                  <span
                    className={styles.zoneDot}
                    style={{
                      background: pct > 80 ? "#c2185b" : pct > 60 ? "#e65100" : "#388e3c",
                    }}
                  />
                  <span className={styles.zoneName}>{name}</span>
                  <span className={styles.zonePct}>{pct}%</span>
                </div>
                <div className={styles.zoneBar}>
                  <div
                    className={styles.zoneBarFill}
                    style={{
                      width: `${pct}%`,
                      background: pct > 80 ? "#c2185b" : pct > 60 ? "#e65100" : "#388e3c",
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#999", textAlign: "center", padding: "20px 0" }}>
              Crea zonas para ver la ocupación
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
