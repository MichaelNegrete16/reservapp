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
  { id: "c1", name: "John Doe", initials: "JD", phone: "+1 (234) 567-8901", email: "john.doe@example.com", visits: 24, lastVisit: "Oct 24, 2023", tags: ["VIP", "Loyal"], avatarColor: "#e3f2fd", notes: "Prefers Table 4. Always orders the vintage Red Wine selection. Allergic to pine nuts.", birthday: "March 12, 1985" },
  { id: "c2", name: "Sarah Miller", initials: "SM", phone: "+1 (555) 123-4567", email: "sarah.m@gmail.com", visits: 12, lastVisit: "Oct 20, 2023", tags: ["Frequent"], avatarColor: "#fce4ec", notes: "Vegetarian. Prefers quiet tables.", birthday: "July 5, 1990" },
  { id: "c3", name: "Robert Wilson", initials: "RW", phone: "+1 (415) 888-9900", email: "robert.wilson@outlook.com", visits: 2, lastVisit: "Sep 15, 2023", tags: ["Blacklist"], avatarColor: "#e8f5e9", notes: "Incident on last visit. Handle with care.", birthday: "—" },
  { id: "c4", name: "Emma Knight", initials: "EK", phone: "+1 (650) 444-5555", email: "emma.k@company.com", visits: 8, lastVisit: "Oct 22, 2023", tags: ["Frequent"], avatarColor: "#fff3e0", notes: "Corporate client. Prefers private area.", birthday: "Nov 3, 1988" },
  { id: "c5", name: "Carlos Méndez", initials: "CM", phone: "+1 (305) 777-2233", email: "c.mendez@mail.com", visits: 31, lastVisit: "Oct 25, 2023", tags: ["VIP", "Frequent"], avatarColor: "#f3e5f5", notes: "Sommelier recommendations appreciated.", birthday: "Jan 18, 1975" },
];

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  VIP: { color: "#c2185b", bg: "#fce4ec" },
  Loyal: { color: "#e65100", bg: "#fff3e0" },
  Frequent: { color: "#1565c0", bg: "#e3f2fd" },
  Blacklist: { color: "#d32f2f", bg: "#ffebee" },
};

const RECENT_BOOKINGS = [
  { date: "OCT 24", title: "Dinner for 4", time: "Completed · 8:30 PM", amount: "$420.00" },
  { date: "SEP 12", title: "Lunch for 2", time: "Completed · 1:00 PM", amount: "$125.50" },
];

export default function ClientesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cliente | null>(CLIENTES[0]);

  const filtered = CLIENTES.filter((c) => {
    const matchTab =
      tab === "all" ||
      (tab === "vip" && c.tags.includes("VIP")) ||
      (tab === "frequent" && c.tags.includes("Frequent")) ||
      (tab === "blacklist" && c.tags.includes("Blacklist"));
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
              placeholder="Search customers by name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.topActions}>
            <button className={styles.btnExport}>
              <FileSpreadsheet size={16} /> Export Excel
            </button>
            <button className={styles.btnAdd}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Customer Database</h1>
          <p className={styles.subtitle}>View and manage your guest relationships and history.</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {(["all", "vip", "frequent", "blacklist"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "all" ? "All Customers" : t === "vip" ? "VIP Only" : t === "frequent" ? "Frequent" : "Blacklist"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Visits</th>
                <th>Last Visit</th>
                <th>Tags</th>
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
              <span className={styles.drawerIdLine}>Customer ID: #R99283</span>
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
              <span className={styles.drawerSectionLabel}>Tags Editor</span>
              <button className={styles.drawerEditBtn}><Plus size={14} /> Edit</button>
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
            <span className={styles.drawerSectionLabel}>Contact Information</span>
            <div className={styles.contactRows}>
              <div className={styles.contactRow}>📞 <span>{selected.phone}</span></div>
              <div className={styles.contactRow}>✉️ <span>{selected.email}</span></div>
              <div className={styles.contactRow}>🎂 <span>{selected.birthday}</span></div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionLabel}>Staff Notes</span>
            <div className={styles.notesBox}>
              <p className={styles.notesText}>&quot;{selected.notes}&quot;</p>
              <div className={styles.notesFooter}>
                <span>Last updated by Manager Alex</span>
                <button className={styles.drawerEditBtn}>Edit Note</button>
              </div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionHeader}>
              <span className={styles.drawerSectionLabel}>Recent Bookings</span>
              <button className={styles.drawerEditBtn}>See All</button>
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

          <button className={styles.btnCreateReservation}>Create Reservation</button>
        </aside>
      )}
    </div>
  );
}
