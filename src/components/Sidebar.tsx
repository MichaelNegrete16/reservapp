"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  CalendarDays,
  LayoutGrid,
  MapPin,
  Clock,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { clearSession } from "@/lib/auth";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard",                  label: "Inicio",        icon: Home },
  { href: "/dashboard/reservas",         label: "Reservas",      icon: CalendarDays },
  { href: "/dashboard/mesas",            label: "Mesas",         icon: LayoutGrid },
  { href: "/dashboard/zonas",            label: "Zonas",         icon: MapPin },
  { href: "/dashboard/horarios",         label: "Horarios",      icon: Clock },
  { href: "/dashboard/clientes",         label: "Clientes",      icon: Users },
  { href: "/dashboard/reportes",         label: "Reportes",      icon: BarChart3 },
  { href: "/dashboard/configuracion",    label: "Configuración", icon: Settings },
  { href: "/dashboard/pos",              label: "Punto de Venta",icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>🍴</div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>ReservApp</span>
          <span className={styles.logoSub}>Admin Dashboard</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${isActive(href) ? styles.navItemActive : ""}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>MR</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Marco Rossi</span>
          <span className={styles.userRole}>Manager</span>
        </div>
        <button
          className={styles.userMenu}
          title="Cerrar sesión"
          onClick={() => { clearSession(); window.location.href = "/login"; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
