"use client";

import { useState } from "react";
import { Search, X, FileSpreadsheet, Plus } from "lucide-react";
import styles from "./Clientes.module.css";

interface Cliente {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  tags: string[];
  avatarColor: string;
  notes: string;
  birthday: string;
}

type Tab = "all" | "vip" | "frequent" | "blacklist";

const CLIENTES: Cliente[] = [
  { id: "c1", name: "Juan Pérez", initials: "JP", phone: "+57 (234) 567-8901", email: "juan.perez@ejemplo.com", visits: 24, lastVisit: "24 oct, 2023", tags: ["VIP", "Leal"], avatarColor: "#e3f2fd", notes: "Prefiere la mesa 4. Siempre pide la selección de vino tinto reserva. Alérgico a los piñones.", birthday: "12 de marzo, 1985" },
  { id: "c2", name: "Sara Milán", initials: "SM", phone: "+57 (555) 123-4567", email: "sara.milan@gmail.com", visits: 12, lastVisit: "20 oct, 2023", tags: ["Frecuente"], avatarColor: "#fce4ec", notes: "Vegetariana. Prefiere mesas tranquilas.", birthday: "5 de julio, 1990" },
  { id: "c3", name: "Roberto Wilson", initials: "RW", phone: "+57 (415) 888-9900", email: "r.wilson@outlook.com", visits: 2, lastVisit: "15 sep, 2023", tags: ["Lista negra"], avatarColor: "#e8f5e9", notes: "Incidente en la última visita. Tratar con cuidado.", birthday: "—" },
  { id: "c4", name: "Emma Knight", initials: "EK", phone: "+57 (650) 444-5555", email: "emma.k@empresa.com", visits: 8, lastVisit: "22 oct, 2023", tags: ["Frecuente"], avatarColor: "#fff3e0", notes: "Cliente corporativo. Prefiere zona privada.", birthday: "3 de nov, 1988" },
  { id: "c5", name: "Carlos Méndez", initials: "CM", phone: "+57 (305) 777-2233", email: "c.mendez@mail.com", visits: 31, lastVisit: "25 oct, 2023", tags: ["VIP", "Frecuente"], avatarColor: "#f3e5f5", notes: "Aprecia las recomendaciones del sommelier.", birthday: "18 de enero, 1975" },
];

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  VIP: { color: "#c2185b", bg: "#fce4ec" },
  Leal: { color: "#e65100", bg: "#fff3e0" },
  Frecuente: { color: "#1565c0", bg: "#e3f2fd" },
  Frequent: { color: "#1565c0", bg: "#e3f2fd" },
  "Lista negra": { color: "#d32f2f", bg: "#ffebee" },
};

const RECENT_BOOKINGS = [
  { date: "OCT 24", title: "Cena para 4", time: "Completada · 8:30 PM", amount: "$420.000" },
  { date: "SEP 12", title: "Almuerzo para 2", time: "Completada · 1:00 PM", amount: "$125.500" },
];

export default function ClientesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cliente | null>(CLIENTES[0]);

  const filtered = CLIENTES.filter((c) => {
    const matchTab =
      tab === "all" ||
      (tab === "vip" && c.tags.includes("VIP")) ||
      (tab === "frequent" && (c.tags.includes("Frecuente") || c.tags.includes("Frequent"))) ||
      (tab === "blacklist" && c.tags.includes("Lista negra"));
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className={styles.page}>
      {/* Left — Table */}
      <div className={styles.tableArea}>
        {/* TopBar */}
        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar por nombre, correo o teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.topActions}>
            <button className={styles.btnExport}>
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
            <button className={styles.btnAdd}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Base de clientes</h1>
          <p className={styles.subtitle}>Visualiza y gestiona las relaciones e historial de tus clientes.</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["all", "vip", "frequent", "blacklist"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "all" ? "Todos" : t === "vip" ? "Solo VIP" : t === "frequent" ? "Frecuentes" : "Lista negra"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Visitas</th>
                <th>Última visita</th>
                <th>Etiquetas</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={selected?.id === c.id ? styles.rowSelected : ""}
                  onClick={() => setSelected(c)}
                >
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatar} style={{ background: c.avatarColor }}>
                        {c.initials}
                      </div>
                      <span className={styles.clientName}>{c.name}</span>
                    </div>
                  </td>
                  <td className={styles.phone}>{c.phone}</td>
                  <td className={styles.email}>{c.email}</td>
                  <td className={styles.visits}>{c.visits}</td>
                  <td className={styles.lastVisit}>{c.lastVisit}</td>
                  <td>
                    <div className={styles.tagsCell}>
                      {c.tags.map((tag) => (
                        <span
                          key={tag}
                          className={styles.tagPill}
                          style={{
                            color: TAG_COLORS[tag]?.color ?? "#555",
                            background: TAG_COLORS[tag]?.bg ?? "#f0f0f0",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — Drawer */}
      {selected && (
        <aside className={styles.drawer}>
          <div className={styles.drawerHeader}>
            <div className={styles.drawerAvatar} style={{ background: selected.avatarColor }}>
              {selected.initials}
            </div>
            <div className={styles.drawerTitleInfo}>
              <h3 className={styles.drawerName}>{selected.name}</h3>
              <span className={styles.drawerIdLine}>ID cliente: #R99283</span>
              <div className={styles.drawerTags}>
                {selected.tags.map((tag) => (
                  <span key={tag} className={styles.tagPill} style={{
                    color: TAG_COLORS[tag]?.color ?? "#555",
                    background: TAG_COLORS[tag]?.bg ?? "#f0f0f0",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button className={styles.drawerClose} onClick={() => setSelected(null)}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <span className={styles.drawerSectionLabel}>Editor de etiquetas</span>
              <button className={styles.drawerEditBtn}><Plus size={14} /> Editar</button>
            </div>
            <div className={styles.drawerTags}>
              {selected.tags.map((tag) => (
                <span key={tag} className={styles.tagPill} style={{
                  color: TAG_COLORS[tag]?.color ?? "#555",
                  background: TAG_COLORS[tag]?.bg ?? "#f0f0f0",
                }}>
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionLabel}>Información de contacto</span>
            <div className={styles.contactRows}>
              <div className={styles.contactRow}>📞 <span>{selected.phone}</span></div>
              <div className={styles.contactRow}>✉️ <span>{selected.email}</span></div>
              <div className={styles.contactRow}>🎂 <span>{selected.birthday}</span></div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionLabel}>Notas del equipo</span>
            <div className={styles.notesBox}>
              <p className={styles.notesText}>&quot;{selected.notes}&quot;</p>
              <div className={styles.notesFooter}>
                <span>Última actualización por Manager Alex</span>
                <button className={styles.drawerEditBtn}>Editar nota</button>
              </div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <span className={styles.drawerSectionLabel}>Reservas recientes</span>
              <button className={styles.drawerEditBtn}>Ver todas</button>
            </div>
            {RECENT_BOOKINGS.map((b) => (
              <div key={b.title} className={styles.bookingRow}>
                <div className={styles.bookingDate}>
                  <span className={styles.bookingMonth}>{b.date.split(" ")[0]}</span>
                  <span className={styles.bookingDay}>{b.date.split(" ")[1]}</span>
                </div>
                <div className={styles.bookingInfo}>
                  <span className={styles.bookingTitle}>{b.title}</span>
                  <span className={styles.bookingTime}>{b.time}</span>
                </div>
                <span className={styles.bookingAmount}>{b.amount}</span>
              </div>
            ))}
          </div>

          <button className={styles.btnCreateReservation}>Crear reserva</button>
        </aside>
      )}
    </div>
  );
}
