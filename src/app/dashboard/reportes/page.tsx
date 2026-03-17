"use client";

import styles from "./Reportes.module.css";

const OVERTIME_DATA = [
  { label: "Oct 01", value: 42 },
  { label: "Oct 07", value: 65 },
  { label: "Oct 14", value: 55 },
  { label: "Oct 21", value: 90 },
  { label: "Oct 25", value: 110 },
  { label: "Oct 28", value: 78 },
  { label: "Oct 31", value: 85 },
];

const ZONES_OCCUPANCY = [
  { name: "Salón principal", pct: 92 },
  { name: "Terraza exterior", pct: 65 },
  { name: "Barra & Lounge", pct: 48 },
  { name: "Sala VIP", pct: 12 },
];

const HEATMAP_HOURS = ["12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM", "12 AM"];
const HEATMAP_DAYS = ["Lun", "Mié", "Vie", "Dom"];
const HEATMAP_DATA: number[][] = [
  [2, 3, 4, 7, 9, 6, 2],
  [3, 4, 5, 8, 10, 7, 3],
  [4, 5, 6, 9, 10, 8, 4],
  [5, 6, 4, 7, 6, 3, 1],
];

const TOP_CLIENTS = [
  { name: "Sofía Chen", visits: 42, avg: "$185.000", last: "28 oct, 2023", status: "VIP" },
  { name: "Marco Johnson", visits: 38, avg: "$210.500", last: "25 oct, 2023", status: "VIP" },
  { name: "Elena Rodríguez", visits: 31, avg: "$155.200", last: "20 oct, 2023", status: "Leal" },
  { name: "David Smith", visits: 27, avg: "$320.000", last: "19 oct, 2023", status: "Leal" },
];

const SPARKLINE_POINTS = [4.2, 4.5, 4.1, 4.8, 5.2, 4.9, 4.8];

function sparklinePath(data: number[]): string {
  const w = 120, h = 40;
  const min = Math.min(...data), max = Math.max(...data);
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export default function ReportesPage() {
  const maxBar = Math.max(...OVERTIME_DATA.map((d) => d.value));

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Resumen de rendimiento</h1>
          <p className={styles.subtitle}>Estadísticas en tiempo real y tendencias de reservas del período actual.</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnFilter}>⚙ Filtrar zonas</button>
          <button className={styles.btnExport}>↓ Exportar PDF</button>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Reservations Over Time */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Reservas a lo largo del tiempo</h3>
            <button className={styles.btnSmall}>Diario ▾</button>
          </div>
          <div className={styles.barChart}>
            {OVERTIME_DATA.map(({ label, value }) => (
              <div key={label} className={styles.barCol}>
                <div
                  className={styles.bar}
                  style={{ height: `${(value / maxBar) * 160}px` }}
                >
                  <span className={styles.barDot} />
                </div>
                <span className={styles.barLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution (Donut) */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Distribución por estado</h3>
          <div className={styles.donutWrapper}>
            <div className={styles.donut} />
            <div className={styles.donutCenter}>
              <span className={styles.donutValue}>1,284</span>
              <span className={styles.donutLabel}>TOTAL</span>

            </div>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={styles.legendDotOrange} /> Confirmadas (75%)</span>
            <span className={styles.legendItem}><span className={styles.legendDotLight} /> Pendientes (15%)</span>
          </div>
        </div>

        {/* Occupancy by Zone */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Ocupación por zona</h3>
          <div className={styles.zoneList}>
            {ZONES_OCCUPANCY.map(({ name, pct }) => (
              <div key={name} className={styles.zoneRow}>
                <div className={styles.zoneRowHeader}>
                  <span className={styles.zoneName}>{name}</span>
                  <span className={styles.zonePct}>{pct}%</span>
                </div>
                <div className={styles.zoneBarBg}>
                  <div
                    className={styles.zoneBarFill}
                    style={{ width: `${pct}%`, background: pct > 80 ? "#e65100" : pct > 60 ? "#f57c00" : "#ffb74d" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className={`${styles.card} ${styles.cardWide}`}>
          <h3 className={styles.cardTitle}>Mapa de calor: horas pico</h3>
          <div className={styles.heatmap}>
            <div className={styles.heatmapYLabels}>
              {HEATMAP_DAYS.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className={styles.heatmapGrid}>
              <div className={styles.heatmapXLabels}>
                {HEATMAP_HOURS.map((h) => <span key={h}>{h}</span>)}
              </div>
              {HEATMAP_DATA.map((row, ri) => (
                <div key={ri} className={styles.heatmapRow}>
                  {row.map((val, ci) => (
                    <div
                      key={ci}
                      className={styles.heatCell}
                      style={{ opacity: 0.1 + (val / 10) * 0.9, background: "#e65100" }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* No-Show Rate */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Tasa de no presentación</h3>
            <span className={styles.trendBadge}>↑ +2.4%</span>
          </div>
          <div className={styles.kpiLarge}>4.8%</div>
          <p className={styles.kpiNote}>Meta: menos del 3.0%</p>
          <svg className={styles.sparkline} viewBox="0 0 120 40">
            <path d={sparklinePath(SPARKLINE_POINTS)} fill="none" stroke="#e65100" strokeWidth="2" />
          </svg>
          <p className={styles.sparklineLabel}>Tendencia últimos 30 días</p>
        </div>

        {/* Top Clients */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top 10 clientes de alto valor</h3>
            <button className={styles.btnSmall} style={{ color: "#e65100" }}>Ver todos</button>
          </div>
          <table className={styles.clientTable}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total visitas</th>
                <th>Gasto promedio</th>
                <th>Última visita</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CLIENTS.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td>{c.visits}</td>
                  <td>{c.avg}</td>
                  <td>{c.last}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        color: c.status === "VIP" || c.status === "Leal" ? (c.status === "VIP" ? "#388e3c" : "#e65100") : "#388e3c",
                        background: c.status === "VIP" ? "#e8f5e9" : "#fff3e0",
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.footer}>© 2024 ReservApp Analytics. Datos actualizados hace 5 minutos.</p>
    </div>
  );
}
