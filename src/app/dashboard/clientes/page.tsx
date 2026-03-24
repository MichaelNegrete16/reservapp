"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, FileSpreadsheet, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
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

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  VIP: { color: "#c2185b", bg: "#fce4ec" },
  Leal: { color: "#e65100", bg: "#fff3e0" },
  Frecuente: { color: "#1565c0", bg: "#e3f2fd" },
  Frequent: { color: "#1565c0", bg: "#e3f2fd" },
  "Lista negra": { color: "#d32f2f", bg: "#ffebee" },
};

const TAB_TO_TAG: Record<Tab, string | null> = {
  all: null,
  vip: "VIP",
  frequent: "Frecuente",
  blacklist: "Lista negra",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = ["#e3f2fd", "#fce4ec", "#e8f5e9", "#fff3e0", "#f3e5f5", "#e0f7fa", "#fff9c4"];

function pickColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ClientesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [editingTags, setEditingTags] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", phone: "", email: "" });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const body: Record<string, unknown> = { page: 1, limit: 50 };
      if (search) body.search = search;
      const tag = TAB_TO_TAG[tab];
      if (tag) body.tag = tag;
      const res = await api.post<{ ok: boolean; data: unknown[] }>("/clients/list", body);
      const mapped: Cliente[] = (res.data as Record<string, unknown>[]).map((c) => ({
        id: c.id as string,
        name: (c.name as string) ?? "",
        initials: getInitials((c.name as string) ?? ""),
        phone: (c.phone as string) ?? "",
        email: (c.email as string) ?? "",
        visits: (c.visits as number) ?? 0,
        lastVisit: (c.lastVisit as string) ?? "—",
        tags: (c.tags as string[]) ?? [],
        avatarColor: pickColor(c.id as string),
        notes: (c.notes as string) ?? "",
        birthday: (c.birthday as string) ?? "—",
      }));
      setClients(mapped);
      if (mapped.length > 0 && !selected) setSelected(mapped[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando clientes");
    } finally {
      setLoading(false);
    }
  }, [search, tab]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleUpdateTags = async (clientId: string, tags: string[]) => {
    try {
      await api.patch(`/clients/${clientId}/tags`, { tags });
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, tags } : c))
      );
      if (selected?.id === clientId) setSelected((prev) => prev ? { ...prev, tags } : prev);
      setEditingTags(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error actualizando etiquetas");
    }
  };

  const handleUpdateNotes = async (clientId: string, notes: string) => {
    try {
      await api.patch(`/clients/${clientId}/notes`, { notes });
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, notes } : c))
      );
      if (selected?.id === clientId) setSelected((prev) => prev ? { ...prev, notes } : prev);
      setEditingNotes(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error actualizando notas");
    }
  };

  const handleCreateClient = async () => {
    if (!newForm.name.trim()) return;
    try {
      const res = await api.post<{ ok: boolean; data: Record<string, unknown> }>("/clients", newForm);
      const c = res.data;
      const nuevo: Cliente = {
        id: c.id as string,
        name: (c.name as string) ?? newForm.name,
        initials: getInitials(newForm.name),
        phone: (c.phone as string) ?? newForm.phone,
        email: (c.email as string) ?? newForm.email,
        visits: 0,
        lastVisit: "—",
        tags: [],
        avatarColor: pickColor(c.id as string),
        notes: "",
        birthday: "—",
      };
      setClients((prev) => [nuevo, ...prev]);
      setShowNewModal(false);
      setNewForm({ name: "", phone: "", email: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creando cliente");
    }
  };

  const RECENT_BOOKINGS = [
    { date: "OCT 24", title: "Cena para 4", time: "Completada · 8:30 PM", amount: "$420.000" },
    { date: "SEP 12", title: "Almuerzo para 2", time: "Completada · 1:00 PM", amount: "$125.500" },
  ];

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
            <button className={styles.btnAdd} onClick={() => setShowNewModal(true)}>
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
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Cargando clientes...</div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: "center", color: "#d32f2f" }}>{error}</div>
          ) : (
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
                {clients.map((c) => (
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
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#999" }}>
                      No se encontraron clientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
              <span className={styles.drawerIdLine}>ID cliente: #{selected.id.slice(0, 8)}</span>
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
              <button
                className={styles.drawerEditBtn}
                onClick={() => {
                  if (editingTags) return;
                  setEditingTags(true);
                  setTagDraft(selected.tags.join(", "));
                }}
              >
                <Plus size={14} /> Editar
              </button>
            </div>
            {editingTags ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13 }}
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  placeholder="VIP, Frecuente, Leal..."
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className={styles.drawerEditBtn}
                    onClick={() =>
                      handleUpdateTags(
                        selected.id,
                        tagDraft.split(",").map((t) => t.trim()).filter(Boolean)
                      )
                    }
                  >
                    Guardar
                  </button>
                  <button className={styles.drawerEditBtn} onClick={() => setEditingTags(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.drawerTags}>
                {selected.tags.map((tag) => (
                  <span key={tag} className={styles.tagPill} style={{
                    color: TAG_COLORS[tag]?.color ?? "#555",
                    background: TAG_COLORS[tag]?.bg ?? "#f0f0f0",
                  }}>
                    {tag} x
                  </span>
                ))}
              </div>
            )}
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
              {editingNotes ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <textarea
                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 13, minHeight: 60, resize: "vertical" }}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className={styles.drawerEditBtn} onClick={() => handleUpdateNotes(selected.id, noteDraft)}>
                      Guardar
                    </button>
                    <button className={styles.drawerEditBtn} onClick={() => setEditingNotes(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.notesText}>&quot;{selected.notes}&quot;</p>
                  <div className={styles.notesFooter}>
                    <span>Última actualización</span>
                    <button
                      className={styles.drawerEditBtn}
                      onClick={() => {
                        setEditingNotes(true);
                        setNoteDraft(selected.notes);
                      }}
                    >
                      Editar nota
                    </button>
                  </div>
                </>
              )}
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

      {/* Modal nuevo cliente */}
      {showNewModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: 12, padding: 24, width: 400, maxWidth: "90vw",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18 }}>Nuevo cliente</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>Nombre *</label>
                <input
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>Teléfono</label>
                <input
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                  value={newForm.phone}
                  onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+57 ..."
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: "block" }}>Correo</label>
                <input
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box" }}
                  value={newForm.email}
                  onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
                onClick={() => setShowNewModal(false)}
              >
                Cancelar
              </button>
              <button
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#e65100", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                onClick={handleCreateClient}
              >
                Crear cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
