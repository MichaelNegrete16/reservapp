"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import styles from "./Mesas.module.css";

interface TableItem {
  id: string;
  number: string;
  shape: "round" | "square";
  capacity: number;
  zone: string;
  x: number;
  y: number;
  selected: boolean;
}

const ZONES = ["Main Dining Room", "Outdoor Terrace", "Bar Lounge", "VIP Room"];
const CAPACITIES = [2, 4, 6, 8, 10, 12];

const INITIAL_TABLES: TableItem[] = [
  { id: "t1", number: "01", shape: "round", capacity: 4, zone: "Main Dining Room", x: 120, y: 80, selected: false },
  { id: "t2", number: "03", shape: "square", capacity: 2, zone: "Main Dining Room", x: 320, y: 220, selected: false },
  { id: "t3", number: "12", shape: "square", capacity: 6, zone: "Main Dining Room", x: 480, y: 120, selected: true },
];

export default function MesasPage() {
  const [shape, setShape] = useState<"round" | "square">("round");
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [zone, setZone] = useState(ZONES[0]);
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const handleAddTable = () => {
    if (!tableNumber.trim()) return;
    const newTable: TableItem = {
      id: `t${Date.now()}`,
      number: tableNumber,
      shape,
      capacity,
      zone,
      x: 80 + Math.random() * 300,
      y: 80 + Math.random() * 200,
      selected: false,
    };
    setTables((prev) => [...prev, newTable]);
    setTableNumber("");
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
    if (!dragging.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragging.current.offsetX, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragging.current.offsetY, rect.height - 80));
    setTables((prev) =>
      prev.map((t) => (t.id === dragging.current!.id ? { ...t, x, y } : t))
    );
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = null;
  }, []);

  const handleDelete = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <aside className={styles.panel}>
        <h2 className={styles.panelTitle}>Add Element</h2>

        {/* Shape Selector */}
        <div className={styles.shapeRow}>
          <button
            className={`${styles.shapeBtn} ${shape === "round" ? styles.shapeBtnActive : ""}`}
            onClick={() => setShape("round")}
          >
            <div className={styles.shapeCircle} />
            ROUND
          </button>
          <button
            className={`${styles.shapeBtn} ${shape === "square" ? styles.shapeBtnActive : ""}`}
            onClick={() => setShape("square")}
          >
            <div className={styles.shapeSquare} />
            SQUARE
          </button>
        </div>

        {/* Fields */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Table Number</label>
          <input
            className={styles.input}
            placeholder="e.g. T-12"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Capacity</label>
          <select
            className={styles.input}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          >
            {CAPACITIES.map((c) => (
              <option key={c} value={c}>
                {c} Persons
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Zone</label>
          <select
            className={styles.input}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            {ZONES.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </div>

        <button className={styles.btnAdd} onClick={handleAddTable}>
          <Plus size={16} /> Add to Floor
        </button>

        {/* Active Tables List */}
        <div className={styles.activeSection}>
          <div className={styles.activeSectionHeader}>
            <span className={styles.sectionLabel}>Active Tables</span>
            <span className={styles.totalBadge}>{tables.length} Total</span>
          </div>
          <div className={styles.tableList}>
            {tables.map((t, i) => (
              <div key={t.id} className={styles.tableListItem}>
                <span className={styles.tableListNum}>{i + 1}</span>
                <div className={styles.tableListInfo}>
                  <span className={styles.tableListName}>Table {t.number}</span>
                  <span className={styles.tableListMeta}>
                    {t.capacity} Seats · {t.zone.split(" ")[0]}
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
          <span className={styles.sectionLabel}>Floor Plan Image</span>
          <div className={styles.uploadZone}>
            <span className={styles.uploadIcon}>↑</span>
            <span>Change Background</span>
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
            Autosave enabled · Last edited 2 mins ago
          </div>
          <div className={styles.bottomActions}>
            <button className={styles.btnDiscard} onClick={() => setTables(INITIAL_TABLES)}>
              Discard changes
            </button>
            <button className={styles.btnSave} onClick={handleSave}>
              <Save size={16} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
