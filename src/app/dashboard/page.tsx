"use client";

import Link from "next/link";
import { Download, Plus } from "lucide-react";
import styles from "./Dashboard.module.css";

const KPIS = [
  { label: "Total Today", value: "42", trend: "+12%", color: "#e65100" },
  { label: "Expected People", value: "128", trend: "+5%", color: "#1565c0" },
  { label: "Confirmed", value: "35", trend: "-2%", color: "#e65100" },
  { label: "Pending", value: "7", trend: "+1%", color: "#6a1b9a" },
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
  { time: "19:30", name: "Julian Casablancas", people: 4, table: "Table 12", status: "ARRIVED", statusColor: "#388e3c" },
  { time: "19:45", name: "Sarah Jenkins", people: 2, table: "Table 4", status: "CONFIRMED", statusColor: "#1565c0" },
  { time: "20:00", name: "David Bowie", people: 6, table: "Table 22", status: "CONFIRMED", statusColor: "#1565c0" },
  { time: "20:15", name: "Mia Wallace", people: 2, table: "Bar", status: "PENDING", statusColor: "#e65100" },
  { time: "20:30", name: "Frank Ocean", people: 5, table: "Table 8", status: "CONFIRMED", statusColor: "#1565c0" },
];

const ZONES = [
  { name: "Main Dining Room", pct: 92 },
  { name: "Terrace Garden", pct: 65 },
  { name: "Lounge Bar", pct: 78 },
];

export default function DashboardHome() {
  const maxBar = Math.max(...HOURS_DATA.map((d) => d.value));

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.greeting}>Good evening, Marco</h1>
          <p className={styles.subGreeting}>
            Here&apos;s what&apos;s happening today at{" "}
            <span className={styles.restaurantName}>La Trattoria</span>
          </p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnOutline}>
            <Download size={16} /> Export
          </button>
          <Link href="/dashboard/reservas/nueva" className={styles.btnPrimary}>
            <Plus size={16} /> New Reservation
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
              <h3 className={styles.chartTitle}>Reservations per Hour</h3>
              <p className={styles.chartSubtitle}>
                Real-time booking distribution
              </p>
            </div>
            <select className={styles.chartSelect}>
              <option>Today</option>
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
          <h3 className={styles.chartTitle}>Upcoming Next</h3>
          <div className={styles.upcomingList}>
            {UPCOMING.map((r) => (
              <div key={r.time + r.name} className={styles.upcomingItem}>
                <span className={styles.upcomingTime}>{r.time}</span>
                <div className={styles.upcomingInfo}>
                  <span className={styles.upcomingName}>{r.name}</span>
                  <span className={styles.upcomingMeta}>
                    {r.people} people · {r.table}
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
            View All Reservations
          </Link>
        </div>
      </div>

      {/* Occupancy */}
      <div className={styles.occupancyCard}>
        <div className={styles.occupancyHeader}>
          <div>
            <h3 className={styles.chartTitle}>Current Venue Occupancy</h3>
            <p className={styles.chartSubtitle}>
              Live capacity status across all zones
            </p>
          </div>
          <div className={styles.occupancyTotal}>
            <span className={styles.occupancyPct}>84%</span>
            <span className={styles.occupancySeats}>84 / 100 Seats Filled</span>
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
