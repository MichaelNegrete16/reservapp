"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import styles from "./Admin.module.css";

const KPIS = [
  { label: "Total restaurantes", value: "1.284", trend: "+12%", icon: "🍴" },
  { label: "Activos este mes",    value: "156",   trend: "+5%",  icon: "⚡" },
  { label: "Total reservas",      value: "45.902",trend: "+18%", icon: "📅" },
];

const WEEKS = ["SEM 1", "SEM 2", "SEM 3", "SEM 4", "SEM 5", "SEM 6", "SEM 7"];
const CHART_DATA = [45, 72, 38, 95, 60, 88, 70];

const LATEST_REGS = [
  { initial: "L", name: "Le Petit Bistro", time: "Hace 2 horas", plan: "PRO",      planColor: "#e65100" },
  { initial: "U", name: "Umami House",     time: "Hace 5 horas", plan: "FREE",     planColor: "#888" },
  { initial: "S", name: "Sushi Zen",       time: "Ayer",          plan: "PLATINUM", planColor: "#6a1b9a" },
  { initial: "B", name: "Burger Barn",     time: "Ayer",          plan: "PRO",      planColor: "#e65100" },
];

const RESTAURANTS = [
  { name: "The Golden Grill", owner: "Marcus Thorne", plan: "PLATINUM ANUAL",  planColor: "#6a1b9a", bookings: "1.204", trend: "+15%", status: "Activo" },
  { name: "Brew & Bites",     owner: "Sarah Jenkins", plan: "PRO MENSUAL",     planColor: "#e65100", bookings: "452",   trend: "-2%",  status: "Activo" },
  { name: "Rustic Dough",     owner: "Luigi Vampa",   plan: "PLAN GRATUITO",   planColor: "#888",    bookings: "89",    trend: "+20%", status: "Suspendido" },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const maxBar = Math.max(...CHART_DATA);

  const filtered = RESTAURANTS.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel General</h1>
          <p className={styles.subtitle}>Métricas de rendimiento en tiempo real</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnDate}>📅 Últimos 30 días</button>
          <button className={styles.btnExport}><Download size={16} /> Exportar informe</button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        {KPIS.map(({ label, value, trend, icon }) => (
          <div key={label} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiIcon}>{icon}</span>
              <span className={styles.kpiTrend}>
                {trend} ↗
              </span>
            </div>
            <div className={styles.kpiLabel}>{label}</div>
            <div className={styles.kpiValue}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart + Latest Registrations */}
      <div className={styles.midRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.cardTitle}>Registros semanales</h3>
            <span className={styles.newBadge}>84 NUEVOS ESTA SEMANA</span>
          </div>
          <div className={styles.lineChart}>
            <svg viewBox="0 0 700 120" className={styles.lineSvg} preserveAspectRatio="none">
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e65100" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#e65100" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${120 - (CHART_DATA[0] / maxBar) * 100} ${CHART_DATA.map((v, i) => `L ${(i / (CHART_DATA.length - 1)) * 700} ${120 - (v / maxBar) * 100}`).join(" ")} L 700 120 L 0 120 Z`}
                fill="url(#grad)"
              />
              <path
                d={`M 0 ${120 - (CHART_DATA[0] / maxBar) * 100} ${CHART_DATA.map((v, i) => `L ${(i / (CHART_DATA.length - 1)) * 700} ${120 - (v / maxBar) * 100}`).join(" ")}`}
                fill="none"
                stroke="#e65100"
                strokeWidth="2.5"
              />
            </svg>
            <div className={styles.chartXLabels}>
              {WEEKS.map((w) => <span key={w}>{w}</span>)}
            </div>
          </div>
        </div>

        <div className={styles.latestCard}>
          <h3 className={styles.cardTitle}>Últimos registros</h3>
          <div className={styles.latestList}>
            {LATEST_REGS.map((r) => (
              <div key={r.name} className={styles.latestItem}>
                <div className={styles.latestAvatar}>{r.initial}</div>
                <div className={styles.latestInfo}>
                  <span className={styles.latestName}>{r.name}</span>
                  <span className={styles.latestTime}>{r.time}</span>
                </div>
                <span
                  className={styles.planBadge}
                  style={{ color: r.planColor, background: `${r.planColor}18` }}
                >
                  {r.plan}
                </span>
              </div>
            ))}
          </div>
          <button className={styles.viewAllBtn}>Ver toda la actividad</button>
        </div>
      </div>

      {/* Restaurant Directory */}
      <div className={styles.directoryCard}>
        <div className={styles.directoryHeader}>
          <h3 className={styles.cardTitle}>Directorio de restaurantes</h3>
          <div className={styles.directoryActions}>
            <div className={styles.searchWrapper}>
              <span>🔍</span>
              <input
                className={styles.searchInput}
                placeholder="Buscar propietario o restaurante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className={styles.filterBtn}>⚙</button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Restaurante y propietario</th>
              <th>Plan actual</th>
              <th>Reservas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.name}>
                <td>
                  <div className={styles.restaurantCell}>
                    <div className={styles.restaurantImg} />
                    <div>
                      <div className={styles.restaurantName}>{r.name}</div>
                      <div className={styles.restaurantOwner}>Propietario: {r.owner}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={styles.planPill}
                    style={{ color: r.planColor, background: `${r.planColor}18` }}
                  >
                    {r.plan}
                  </span>
                </td>
                <td>
                  <div className={styles.bookingsCell}>
                    <span className={styles.bookingsCount}>{r.bookings}</span>
                    <span
                      className={styles.bookingsTrend}
                      style={{ color: r.trend.startsWith("+") ? "#388e3c" : "#d32f2f" }}
                    >
                      {r.trend} este mes
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.statusCell}>
                    <span
                      className={styles.statusDot}
                      style={{ background: r.status === "Activo" ? "#388e3c" : "#d32f2f" }}
                    />
                    <span
                      style={{ color: r.status === "Activo" ? "#388e3c" : "#d32f2f", fontWeight: 600, fontSize: 13 }}
                    >
                      {r.status}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <button className={styles.actionBtn}>✏</button>
                    <button className={styles.actionBtn}>⊘</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>
            Mostrando 1-10 de 1.284 restaurantes
          </span>
          <div className={styles.paginationBtns}>
            <button className={styles.pgBtn} onClick={() => setPage(Math.max(1, page - 1))}>Anterior</button>
            <button className={`${styles.pgBtn} ${styles.pgBtnActive}`} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
