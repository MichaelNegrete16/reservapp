"use client";

import { useEffect, useState } from "react";
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
  Lock,
} from "lucide-react";
import { getMe, getPlanInfo, logout, planHasFeature } from "@/lib/auth";
import type { AuthUser, PlanInfo } from "@/lib/auth";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  feature?: string; // if set, requires this plan feature
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",                  label: "Inicio",        icon: Home },
  { href: "/dashboard/reservas",         label: "Reservas",      icon: CalendarDays },
  { href: "/dashboard/mesas",            label: "Mesas",         icon: LayoutGrid },
  { href: "/dashboard/zonas",            label: "Zonas",         icon: MapPin },
  { href: "/dashboard/horarios",         label: "Horarios",      icon: Clock },
  { href: "/dashboard/clientes",         label: "Clientes",      icon: Users, feature: "clients" },
  { href: "/dashboard/reportes",         label: "Reportes",      icon: BarChart3, feature: "reports" },
  { href: "/dashboard/configuracion",    label: "Configuración", icon: Settings },
  { href: "/dashboard/pos",              label: "Punto de Venta",icon: ShoppingCart, feature: "pos" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    enterprise: "Enterprise",
  };
  return labels[plan] ?? plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        /* user not authenticated, ignore */
      });
    getPlanInfo()
      .then(setPlan)
      .catch(() => {
        /* plan info unavailable, ignore */
      });
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>🍴</div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>ReservApp</span>
          <span className={styles.logoSub}>
            {user?.restaurant?.name ?? "Admin Dashboard"}
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ href, label, icon: Icon, feature }) => {
          const locked = feature ? !planHasFeature(plan, feature) : false;

          return (
            <Link
              key={href}
              href={locked ? "#" : href}
              className={`${styles.navItem} ${isActive(href) ? styles.navItemActive : ""}`}
              onClick={locked ? (e) => e.preventDefault() : undefined}
              style={locked ? { opacity: 0.5, cursor: "default" } : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
              {locked && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#f3e5f5",
                    color: "#7b1fa2",
                    padding: "2px 6px",
                    borderRadius: 4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Lock size={10} /> PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user ? getInitials(user.name) : "..."}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name ?? "Cargando..."}</span>
          <span className={styles.userRole}>
            {plan ? `Plan ${formatPlanLabel(plan.plan)}` : user?.role ?? ""}
          </span>
        </div>
        <button
          className={styles.userMenu}
          title="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
