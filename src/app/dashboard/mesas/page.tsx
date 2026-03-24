"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import { api } from "@/lib/api-client";
import styles from "./Mesas.module.css";

interface ZoneItem {
  id: string;
  name: string;
}

interface TableItem {
  id: string;
  number: string;
  shape: "round" | "square";
  capacity: number;
  zoneId: string;
  zoneName: string;
  x: number;
  y: number;
  selected: boolean;
}

const CAPACITIES = [2, 4, 6, 8, 10, 12];

export default function MesasPage() {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [shape, setShape] = useState<"round" | "square">("round");
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [zoneId, setZoneId] = useState("");
  const [tables, setTables] = useState<TableItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const originalTables = useRef<TableItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [zonesRes, tablesRes] = await Promise.all([
        api.get<{ ok: boolean; data: ZoneItem[] }>("/zones"),
        api.get<{ ok: boolean; data: Array<{ id: string; number: string; shape: "round" | "square"; capacity: number; zoneId: string; x: number; y: number }> }>("/tables"),
      ]);
      const zonesList = zonesRes.data;
      setZones(zonesList);
      if (zonesList.length > 0 && !zoneId) {
        setZoneId(zonesList[0].id);
      }
      const zoneMap = new Map(zonesList.map((z) => [z.id, z.name]));
      const mapped: TableItem[] = tablesRes.data.map((t) => ({
        ...t,
        zoneName: zoneMap.get(t.zoneId) || "Sin zona",
        selected: false,
      }));
      setTables(mapped);
      originalTables.current = mapped;
    } catch {
      /* handled globally */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTable = async () => {
    if (!tableNumber.trim() || !zoneId) return;
    setSaving(true);
    try {
      const x = 80 + Math.random() * 300;
      const y = 80 + Math.random() * 200;
      const res = await api.post<{ ok: boolean; data: { id: string; number: string; shape: "round" | "square"; capacity: number; zoneId: string; x: number; y: number } }>("/tables", {
        number: tableNumber, shape, capacity, zoneId, x, y,
      });
      const zoneMap = new Map(zones.map((z) => [z.id, z.name]));
      const newTable: TableItem = {
        ...res.data,
        zoneName: zoneMap.get(res.data.zoneId) || "Sin zona",
        selected: false,
      };
      setTables((prev) => [...prev, newTable]);
      setTableNumber("");
    } catch {
      // PlanLimitError is handled globally by PlanLimitModal
    } finally {
      setSaving(false);
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      const rect = canvasRef.current!.getBoundingClientRect();
      const table = tables.find((t) => t.id === id)!;
      dragging.current = {
        id,
        offsetX: e.clientX - rect.left - table.x,
        offsetY: e.clientY - rect.top - table.y,
      };
      setTables((prev) =>
        prev.map((t) => ({ ...t, selected: t.id === id }))
      );
    },
    [tables]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragging.current;
    if (!d || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - d.offsetX, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - d.offsetY, rect.height - 80));
    const dragId = d.id;
    setTables((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, x, y } : t))
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/tables/${id}`);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch {
      /* handled globally */
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/tables/bulk-update", {
        tables: tables.map((t) => ({ id: t.id, x: t.x, y: t.y })),
      });
      originalTables.current = [...tables];
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* handled globally */
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setTables(originalTables.current.map((t) => ({ ...t, selected: false })));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          Cargando mesas...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <aside className={styles.panel}>
        <h2 className={styles.panelTitle}>Agregar elemento</h2>

        {/* Shape Selector */}
        <div className={styles.shapeRow}>
          <button
            className={`${styles.shapeBtn} ${shape === "round" ? styles.shapeBtnActive : ""}`}
            onClick={() => setShape("round")}
          >
            <div className={styles.shapeCircle} />
            REDONDA
          </button>
          <button
            className={`${styles.shapeBtn} ${shape === "square" ? styles.shapeBtnActive : ""}`}
            onClick={() => setShape("square")}
          >
            <div className={styles.shapeSquare} />
            CUADRADA
          </button>
        </div>

        {/* Fields */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Número de mesa</label>
          <input
            className={styles.input}
            placeholder="ej. M-12"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Capacidad</label>
          <select
            className={styles.input}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          >
            {CAPACITIES.map((c) => (
              <option key={c} value={c}>
                {c} personas
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Zona</label>
          <select
            className={styles.input}
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <button className={styles.btnAdd} onClick={handleAddTable} disabled={saving}>
          <Plus size={16} /> {saving ? "Agregando..." : "Agregar al plano"}
        </button>

        {/* Active Tables List */}
        <div className={styles.activeSection}>
          <div className={styles.activeSectionHeader}>
            <span className={styles.sectionLabel}>Mesas activas</span>
            <span className={styles.totalBadge}>{tables.length} total</span>
          </div>
          <div className={styles.tableList}>
            {tables.map((t, i) => (
              <div key={t.id} className={styles.tableListItem}>
                <span className={styles.tableListNum}>{i + 1}</span>
                <div className={styles.tableListInfo}>
                  <span className={styles.tableListName}>Mesa {t.number}</span>
                  <span className={styles.tableListMeta}>
                    {t.capacity} pax · {t.zoneName.split(" ")[0]}
                  </span>
                </div>
                <button
                  className={styles.tableListDelete}
                  onClick={() => handleDelete(t.id)}
                >
                  <GripVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Plan Image */}
        <div className={styles.uploadSection}>
          <span className={styles.sectionLabel}>Imagen del plano</span>
          <div className={styles.uploadZone}>
            <span className={styles.uploadIcon}>↑</span>
            <span>Cambiar fondo</span>
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <div className={styles.canvasWrapper}>
        <div
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {tables.map((t) => (
            <div
              key={t.id}
              className={`${styles.tableEl} ${t.selected ? styles.tableElSelected : ""} ${
                t.shape === "round" ? styles.tableRound : styles.tableSquare
              }`}
              style={{ left: t.x, top: t.y }}
              onMouseDown={(e) => handleMouseDown(e, t.id)}
            >
              <span className={styles.tableElNum}>{t.number}</span>
              <span className={styles.tableElCap}>{"· ".repeat(t.capacity / 2)}</span>
              {t.selected && (
                <button
                  className={styles.tableDeleteBtn}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.autosave}>
            <span className={styles.autosaveDot} />
            Autoguardado activo
          </div>
          <div className={styles.bottomActions}>
            <button className={styles.btnDiscard} onClick={handleDiscard}>
              Descartar cambios
            </button>
            <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
