"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed, CreditCard, ScrollText, LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth";
import styles from "./AdminLayout.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>🍴</div>
          <div>
            <div className={styles.logoTitle}>ReservApp</div>
            <div className={styles.logoSub}>SUPER ADMIN</div>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.userRow}>
          <div className={styles.userAvatar}>AR</div>
          <div>
            <div className={styles.userName}>Alex Rivera</div>
            <div className={styles.userRole}>System Owner</div>
          </div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", marginLeft: "auto", display: "flex", padding: 4 }}
            title="Cerrar sesión"
            onClick={() => { clearSession(); window.location.href = "/login"; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
