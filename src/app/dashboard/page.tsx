"use client";

import Link from "next/link";
import { Download, Plus } from "lucide-react";
import styles from "./Dashboard.module.css";

const KPIS = [
  { label: "Reservas hoy",      value: "42",  trend: "+12%", color: "#e65100" },
  { label: "Personas esperadas",value: "128", trend: "+5%",  color: "#1565c0" },
  { label: "Confirmadas",       value: "35",  trend: "-2%",  color: "#e65100" },
  { label: "Pendientes",        value: "7",   trend: "+1%",  color: "#6a1b9a" },
];

const HOURS_DATA = [
  { label: "12pm", value: 25 },
  { label: "2pm", value: 35 },
  { label: "4pm", value: 20 },
  { label: "6pm", value: 85 },
  { label: "8pm", value: 55 },
  { label: "10pm", value: 65 },
];

const UPCOMING = [
  { time: "19:30", name: "Julian Casablancas", people: 4, table: "Mesa 12", status: "LLEGÓ",      statusColor: "#388e3c" },
  { time: "19:45", name: "Sarah Jenkins",      people: 2, table: "Mesa 4",  status: "CONFIRMADO", statusColor: "#1565c0" },
  { time: "20:00", name: "David Bowie",        people: 6, table: "Mesa 22", status: "CONFIRMADO", statusColor: "#1565c0" },
  { time: "20:15", name: "Mia Wallace",        people: 2, table: "Barra",   status: "PENDIENTE",  statusColor: "#e65100" },
  { time: "20:30", name: "Frank Ocean",        people: 5, table: "Mesa 8",  status: "CONFIRMADO", statusColor: "#1565c0" },
];

const ZONES = [
  { name: "Salón principal", pct: 92 },
  { name: "Terraza jardín",  pct: 65 },
  { name: "Barra lounge",    pct: 78 },
];

export default function DashboardHome() {
  const maxBar = Math.max(...HOURS_DATA.map((d) => d.value));

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.greeting}>Buenas noches, Marco</h1>
          <p className={styles.subGreeting}>
            Esto es lo que está pasando hoy en{" "}
            <span className={styles.restaurantName}>La Trattoria</span>
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
        {KPIS.map(({ label, value, trend, color }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiBar} style={{ background: color }} />
            <span className={styles.kpiLabel}>{label}</span>
            <div className={styles.kpiRow}>
              <span className={styles.kpiValue}>{value}</span>
              <span
                className={styles.kpiTrend}
                style={{ color: trend.startsWith("+") ? "#388e3c" : "#d32f2f" }}
              >
                {trend}
              </span>
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
                Distribución de reservas en tiempo real
              </p>
            </div>
            <select className={styles.chartSelect}>
              <option>Hoy</option>
            </select>
          </div>
          <div className={styles.barChart}>
            {HOURS_DATA.map(({ label, value }) => (
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
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div className={styles.upcomingCard}>
          <h3 className={styles.chartTitle}>Próximas reservas</h3>
          <div className={styles.upcomingList}>
            {UPCOMING.map((r) => (
              <div key={r.time + r.name} className={styles.upcomingItem}>
                <span className={styles.upcomingTime}>{r.time}</span>
                <div className={styles.upcomingInfo}>
                  <span className={styles.upcomingName}>{r.name}</span>
                  <span className={styles.upcomingMeta}>
                    {r.people} personas · {r.table}
                  </span>
                </div>
                <span
                  className={styles.upcomingStatus}
                  style={{
                    color: r.statusColor,
                    background: `${r.statusColor}15`,
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/reservas"
            className={styles.viewAllBtn}
          >
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
            <span className={styles.occupancyPct}>84%</span>
            <span className={styles.occupancySeats}>84 / 100 asientos ocupados</span>
          </div>
        </div>
        <div className={styles.occupancyBarBg}>
          <div className={styles.occupancyBarFill} style={{ width: "84%" }} />
        </div>
        <div className={styles.zonesRow}>
          {ZONES.map(({ name, pct }) => (
            <div key={name} className={styles.zoneItem}>
              <div className={styles.zoneInfo}>
                <span
                  className={styles.zoneDot}
                  style={{
                    background:
                      pct > 80 ? "#c2185b" : pct > 60 ? "#e65100" : "#388e3c",
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
                    background:
                      pct > 80 ? "#c2185b" : pct > 60 ? "#e65100" : "#388e3c",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
