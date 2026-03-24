"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Toggle from "@/components/Toggle";
import Modal from "@/components/Modal";
import { api } from "@/lib/api-client";
import styles from "./Zonas.module.css";

interface Zona {
  id: string;
  name: string;
  type: string;
  floor: string;
  description: string;
  capacity: number;
  active: boolean;
}

const ITEMS_PER_PAGE = 4;

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editZona, setEditZona] = useState<Zona | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCapacity, setFormCapacity] = useState(20);
  const [formType, setFormType] = useState("interior");
  const [formFloor, setFormFloor] = useState("Planta baja");

  const fetchZonas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ ok: boolean; data: Zona[] }>("/zones");
      setZonas(res.data);
    } catch {
      /* handled globally */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  const totalPages = Math.ceil(zonas.length / ITEMS_PER_PAGE);
  const paged = zonas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCapacity = zonas.reduce((s, z) => s + z.capacity, 0);
  const activeCount = zonas.filter((z) => z.active).length;
  const maintenanceCount = zonas.filter((z) => !z.active).length;

  const toggleZona = async (id: string) => {
    try {
      await api.patch(`/zones/${id}/toggle`);
      setZonas((prev) => prev.map((z) => z.id === id ? { ...z, active: !z.active } : z));
    } catch {
      /* handled globally */
    }
  };

  const openAdd = () => {
    setEditZona(null);
    setFormName(""); setFormDesc(""); setFormCapacity(20);
    setFormType("interior"); setFormFloor("Planta baja");
    setShowModal(true);
  };

  const openEdit = (zona: Zona) => {
    setEditZona(zona);
    setFormName(zona.name); setFormDesc(zona.description);
    setFormCapacity(zona.capacity); setFormType(zona.type);
    setFormFloor(zona.floor);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editZona) {
        const res = await api.patch<{ ok: boolean; data: Zona }>(`/zones/${editZona.id}`, {
          name: formName, description: formDesc, capacity: formCapacity, type: formType, floor: formFloor,
        });
        setZonas((prev) => prev.map((z) => z.id === editZona.id ? res.data : z));
      } else {
        const res = await api.post<{ ok: boolean; data: Zona }>("/zones", {
          name: formName, description: formDesc, capacity: formCapacity, type: formType, floor: formFloor,
        });
        setZonas((prev) => [...prev, res.data]);
      }
      setShowModal(false);
    } catch {
      /* handled globally */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/zones/${id}`);
      setZonas((prev) => prev.filter((z) => z.id !== id));
    } catch {
      /* handled globally */
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Zonas</h1>
          <p className={styles.subtitle}>Configura y administra las áreas de asientos, planos y capacidades de cada sección.</p>
        </div>
        <button className={styles.btnAdd} onClick={openAdd}>
          <Plus size={16} /> Agregar zona
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total zonas</span>
          <span className={styles.kpiValue}>{zonas.length}</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
          <span className={styles.kpiLabel}>Capacidad total</span>
          <span className={styles.kpiValue}>{totalCapacity}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Activas</span>
          <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>{activeCount}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Mantenimiento</span>
          <span className={`${styles.kpiValue} ${styles.kpiOrange}`}>{maintenanceCount}</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          Cargando zonas...
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th />
                <th>Nombre de zona</th>
                <th>Descripción</th>
                <th>Capacidad máx.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((z) => (
                <tr key={z.id} className={!z.active ? styles.rowInactive : ""}>
                  <td>
                    <div className={styles.zoneIcon}>🪑</div>
                  </td>
                  <td>
                    <div className={styles.zoneName}>{z.name}</div>
                    <div className={styles.zoneMeta}>{z.type} · {z.floor}</div>
                  </td>
                  <td className={styles.zoneDesc}>{z.description}</td>
                  <td>
                    <span className={styles.capacityBadge}>👥 {z.capacity} pax</span>
                  </td>
                  <td>
                    <Toggle checked={z.active} onChange={() => toggleZona(z.id)} />
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEdit(z)}>
                        <Pencil size={16} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(z.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              Mostrando 1 a {paged.length} de {zonas.length} zonas
            </span>
            <div className={styles.pageButtons}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          title={editZona ? "Editar zona" : "Agregar zona"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : editZona ? "Guardar cambios" : "Agregar zona"}
              </button>
            </>
          }
        >
          <div className={styles.modalForm}>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Nombre de zona</label>
              <input className={styles.modalInput} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ej. Salón principal" />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Descripción</label>
              <textarea className={styles.modalTextarea} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className={styles.modalRow}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Tipo</label>
                <select className={styles.modalInput} value={formType} onChange={(e) => setFormType(e.target.value)}>
                  {[
                    { value: "interior", label: "Interior" },
                    { value: "exterior", label: "Exterior" },
                    { value: "eventos", label: "Eventos" },
                    { value: "vip", label: "VIP" },
                  ].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Capacidad</label>
                <input type="number" className={styles.modalInput} value={formCapacity} onChange={(e) => setFormCapacity(Number(e.target.value))} min={1} />
              </div>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Piso / Ubicación</label>
              <input className={styles.modalInput} value={formFloor} onChange={(e) => setFormFloor(e.target.value)} placeholder="ej. Planta baja" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
