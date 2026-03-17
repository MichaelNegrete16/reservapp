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
  { id: "z1", name: "Salón principal", type: "Interior", floor: "Planta baja", description: "Área principal de mesas con acceso central al buffet.", capacity: 120, active: true },
  { id: "z2", name: "Terraza exterior", type: "Exterior", floor: "Vista al jardín", description: "Comedor al aire libre rodeado de vegetación.", capacity: 45, active: true },
  { id: "z3", name: "Suite privada A", type: "Eventos", floor: "Segundo piso", description: "Área exclusiva para eventos corporativos. Actualmente cerrada.", capacity: 20, active: false },
  { id: "z4", name: "Barra lounge", type: "Interior", floor: "Área de entrada", description: "Asientos altos para servicio rápido y cócteles.", capacity: 35, active: true },
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
    setFormType("Interior"); setFormFloor("Planta baja");
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

      {/* Table */}
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

      {/* Modal */}
      {showModal && (
        <Modal
          title={editZona ? "Editar zona" : "Agregar zona"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSave}>
                {editZona ? "Guardar cambios" : "Agregar zona"}
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
                  {["Interior", "Exterior", "Eventos", "VIP"].map((t) => <option key={t}>{t}</option>)}
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
