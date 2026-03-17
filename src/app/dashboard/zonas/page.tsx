"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Toggle from "@/components/Toggle";
import Modal from "@/components/Modal";
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

const INITIAL_ZONAS: Zona[] = [
  { id: "z1", name: "Main Dining Hall", type: "Indoor", floor: "Ground Floor", description: "Primary seating area with central access to the buffet.", capacity: 120, active: true },
  { id: "z2", name: "Outdoor Terrace", type: "Outdoor", floor: "Garden View", description: "Open-air dining experience surrounded by greenery.", capacity: 45, active: true },
  { id: "z3", name: "Private Suite A", type: "Event", floor: "Second Floor", description: "Exclusive booking area for corporate events. Currently closed.", capacity: 20, active: false },
  { id: "z4", name: "Bar Lounge", type: "Indoor", floor: "Entrance Area", description: "High-top seating for quick service and cocktails.", capacity: 35, active: true },
];

const ITEMS_PER_PAGE = 4;

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>(INITIAL_ZONAS);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editZona, setEditZona] = useState<Zona | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCapacity, setFormCapacity] = useState(20);
  const [formType, setFormType] = useState("Indoor");
  const [formFloor, setFormFloor] = useState("Ground Floor");

  const totalPages = Math.ceil(zonas.length / ITEMS_PER_PAGE);
  const paged = zonas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCapacity = zonas.reduce((s, z) => s + z.capacity, 0);
  const activeCount = zonas.filter((z) => z.active).length;
  const maintenanceCount = zonas.filter((z) => !z.active).length;

  const toggleZona = (id: string) => {
    setZonas((prev) => prev.map((z) => z.id === id ? { ...z, active: !z.active } : z));
  };

  const openAdd = () => {
    setEditZona(null);
    setFormName(""); setFormDesc(""); setFormCapacity(20);
    setFormType("Indoor"); setFormFloor("Ground Floor");
    setShowModal(true);
  };

  const openEdit = (zona: Zona) => {
    setEditZona(zona);
    setFormName(zona.name); setFormDesc(zona.description);
    setFormCapacity(zona.capacity); setFormType(zona.type);
    setFormFloor(zona.floor);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editZona) {
      setZonas((prev) => prev.map((z) => z.id === editZona.id
        ? { ...z, name: formName, description: formDesc, capacity: formCapacity, type: formType, floor: formFloor }
        : z
      ));
    } else {
      setZonas((prev) => [...prev, {
        id: `z${Date.now()}`, name: formName, description: formDesc,
        capacity: formCapacity, type: formType, floor: formFloor, active: true,
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setZonas((prev) => prev.filter((z) => z.id !== id));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Zones Management</h1>
          <p className={styles.subtitle}>Configure and manage your venue&apos;s seating areas, floor plans, and section capacities.</p>
        </div>
        <button className={styles.btnAdd} onClick={openAdd}>
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Zones</span>
          <span className={styles.kpiValue}>{zonas.length}</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardOrange}`}>
          <span className={styles.kpiLabel}>Total Capacity</span>
          <span className={styles.kpiValue}>{totalCapacity}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Active</span>
          <span className={`${styles.kpiValue} ${styles.kpiGreen}`}>{activeCount}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Maintenance</span>
          <span className={`${styles.kpiValue} ${styles.kpiOrange}`}>{maintenanceCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              <th>Zone Name</th>
              <th>Description</th>
              <th>Max Capacity</th>
              <th>Status</th>
              <th>Actions</th>
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
            Showing 1 to {paged.length} of {zonas.length} zones
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

      {/* Modal */}
      {showModal && (
        <Modal
          title={editZona ? "Edit Zone" : "Add New Zone"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.btnSave} onClick={handleSave}>
                {editZona ? "Save Changes" : "Add Zone"}
              </button>
            </>
          }
        >
          <div className={styles.modalForm}>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Zone Name</label>
              <input className={styles.modalInput} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Main Dining Hall" />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Description</label>
              <textarea className={styles.modalTextarea} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
            </div>
            <div className={styles.modalRow}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Type</label>
                <select className={styles.modalInput} value={formType} onChange={(e) => setFormType(e.target.value)}>
                  {["Indoor", "Outdoor", "Event", "VIP"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Capacity</label>
                <input type="number" className={styles.modalInput} value={formCapacity} onChange={(e) => setFormCapacity(Number(e.target.value))} min={1} />
              </div>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Floor / Location</label>
              <input className={styles.modalInput} value={formFloor} onChange={(e) => setFormFloor(e.target.value)} placeholder="e.g. Ground Floor" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
