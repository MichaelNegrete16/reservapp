"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, X, Trash2 } from "lucide-react";
import Toggle from "@/components/Toggle";
import Modal from "@/components/Modal";
import { api } from "@/lib/api-client";
import styles from "./Horarios.module.css";

interface Turno {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  interval: number;
  maxReservations: number;
  active: boolean;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
}

interface WeeklyAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const DAY_KEYS: (keyof WeeklyAvailability)[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export default function HorariosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [weekly, setWeekly] = useState<WeeklyAvailability>({
    monday: true, tuesday: true, wednesday: true, thursday: true,
    friday: true, saturday: true, sunday: false,
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Shift modal state
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editShift, setEditShift] = useState<Turno | null>(null);
  const [shiftName, setShiftName] = useState("");
  const [shiftStart, setShiftStart] = useState("12:00");
  const [shiftEnd, setShiftEnd] = useState("16:00");
  const [shiftInterval, setShiftInterval] = useState(30);
  const [shiftMax, setShiftMax] = useState(20);

  // Holiday name input
  const [holidayName, setHolidayName] = useState("");

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ ok: boolean; data: { shifts: Turno[]; weekly: WeeklyAvailability; holidays: Holiday[] } }>("/schedules");
      setTurnos(res.data.shifts);
      setWeekly(res.data.weekly);
      setHolidays(res.data.holidays);
    } catch {
      /* handled globally */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const openDays = DAY_KEYS.map((key) => weekly[key]);

  const toggleDay = async (i: number) => {
    const key = DAY_KEYS[i];
    const newWeekly = { ...weekly, [key]: !weekly[key] };
    setWeekly(newWeekly);
    try {
      await api.patch("/schedules/weekly", newWeekly);
    } catch {
      setWeekly(weekly); // revert on error
    }
  };

  const removeHoliday = async (id: string) => {
    try {
      await api.del(`/schedules/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch {
      /* handled globally */
    }
  };

  const addHoliday = async () => {
    if (!selectedCalDay) return;
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(selectedCalDay).padStart(2, "0")}`;
    const name = holidayName.trim() || "Fecha personalizada";
    try {
      const res = await api.post<{ ok: boolean; data: Holiday }>("/schedules/holidays", { date, name });
      setHolidays((prev) => [...prev, res.data]);
      setHolidayName("");
      setSelectedCalDay(null);
    } catch {
      /* handled globally */
    }
  };

  const formatHolidayLabel = (h: Holiday) => {
    const d = new Date(h.date + "T12:00:00");
    const month = d.toLocaleDateString("es-CO", { month: "short" });
    const day = d.getDate();
    return `${month} ${day} · ${h.name}`;
  };

  // Shift CRUD
  const openAddShift = () => {
    setEditShift(null);
    setShiftName(""); setShiftStart("12:00"); setShiftEnd("16:00");
    setShiftInterval(30); setShiftMax(20);
    setShowShiftModal(true);
  };

  const openEditShift = (shift: Turno) => {
    setEditShift(shift);
    setShiftName(shift.name); setShiftStart(shift.startTime); setShiftEnd(shift.endTime);
    setShiftInterval(shift.interval); setShiftMax(shift.maxReservations);
    setShowShiftModal(true);
  };

  const handleSaveShift = async () => {
    if (!shiftName.trim()) return;
    setSaving(true);
    try {
      if (editShift) {
        const res = await api.patch<{ ok: boolean; data: Turno }>(`/schedules/shifts/${editShift.id}`, {
          name: shiftName, startTime: shiftStart, endTime: shiftEnd,
          interval: shiftInterval, maxReservations: shiftMax,
        });
        setTurnos((prev) => prev.map((t) => t.id === editShift.id ? res.data : t));
      } else {
        const res = await api.post<{ ok: boolean; data: Turno }>("/schedules/shifts", {
          name: shiftName, startTime: shiftStart, endTime: shiftEnd,
          interval: shiftInterval, maxReservations: shiftMax,
        });
        setTurnos((prev) => [...prev, res.data]);
      }
      setShowShiftModal(false);
    } catch {
      /* handled globally */
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await api.del(`/schedules/shifts/${id}`);
      setTurnos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      /* handled globally */
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
          Cargando horarios...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Horarios y turnos</h1>
        <p className={styles.subtitle}>
          Define los horarios de operación, la capacidad por turno y los días festivos para gestionar la disponibilidad del restaurante.
        </p>
      </div>

      {/* Section 1: Reservation Blocks */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🕐</span> 1. Bloques de reserva
        </h2>
        <div className={styles.turnosGrid}>
          {turnos.map((t) => (
            <div key={t.id} className={styles.turnoCard}>
              <div className={styles.turnoHeader}>
                <span className={styles.activeChip}>Activo</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className={styles.editBtn} onClick={() => openEditShift(t)}><Pencil size={14} /></button>
                  <button className={styles.editBtn} onClick={() => handleDeleteShift(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className={styles.turnoName}>{t.name}</h3>
              <div className={styles.turnoRow}>
                <span className={styles.turnoLabel}>Inicio / Fin</span>
                <span className={styles.turnoValue}>{t.startTime} - {t.endTime}</span>
              </div>
              <div className={styles.turnoRow}>
                <span className={styles.turnoLabel}>Intervalo</span>
                <span className={styles.turnoValue}>{t.interval} min</span>
              </div>
              <div className={styles.turnoRow}>
                <span className={styles.turnoLabel}>Máx. reservas</span>
                <span className={styles.turnoValue}>{t.maxReservations} por franja</span>
              </div>
              <div className={styles.turnoStripes} />
            </div>
          ))}
          <button className={styles.addTurnoBtn} onClick={openAddShift}>
            <Plus size={18} /> Agregar turno
          </button>
        </div>
      </section>

      {/* Section 2: Weekly Availability */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>⬛</span> 2. Disponibilidad semanal
        </h2>
        <div className={styles.weekGrid}>
          {DAYS.map((day, i) => (
            <div key={day} className={`${styles.dayCard} ${!openDays[i] ? styles.dayCardClosed : ""}`}>
              <span className={styles.dayLabel}>{day}</span>
              <Toggle checked={openDays[i]} onChange={() => toggleDay(i)} />
              <span className={`${styles.dayStatus} ${openDays[i] ? styles.dayOpen : styles.dayClosed}`}>
                {openDays[i] ? "Abierto" : "CERRADO"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Holidays */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📅</span> 3. Festivos y cierres especiales
        </h2>
        <div className={styles.holidaysGrid}>
          <div className={styles.calendarPanel}>
            <h4 className={styles.calPanelTitle}>Seleccionar fecha de cierre</h4>
            <div className={styles.calendar}>
              <div className={styles.calHeader}>
                <button className={styles.calNavBtn}>‹</button>
                <span className={styles.calMonth}>
                  {today.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                </span>
                <button className={styles.calNavBtn}>›</button>
              </div>
              <div className={styles.calGrid}>
                {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
                  <span key={d + i} className={styles.calDayLabel}>{d}</span>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedCalDay === day;
                  const isToday = day === today.getDate();
                  return (
                    <button
                      key={day}
                      className={`${styles.calDay} ${isSelected ? styles.calDaySelected : ""} ${isToday ? styles.calDayToday : ""}`}
                      onClick={() => setSelectedCalDay(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedCalDay && (
              <div style={{ marginTop: 8 }}>
                <input
                  style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff", fontSize: 13 }}
                  placeholder="Nombre del festivo (opcional)"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className={styles.closuresPanel}>
            <h4 className={styles.calPanelTitle}>Próximos cierres</h4>
            <div className={styles.holidayChips}>
              {holidays.map((h) => (
                <span key={h.id} className={styles.holidayChip}>
                  {formatHolidayLabel(h)}
                  <button className={styles.holidayRemove} onClick={() => removeHoliday(h.id)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button className={styles.addCustomBtn} onClick={addHoliday} disabled={!selectedCalDay}>
                <Plus size={14} /> Agregar fecha
              </button>
            </div>
            <div className={styles.infoNote}>
              <span className={styles.infoIcon}>ℹ</span>
              Marcar un día como cerrado notificará automáticamente a los clientes con reservas existentes e impedirá nuevas reservas.
            </div>
          </div>
        </div>
      </section>

      {/* Shift Modal */}
      {showShiftModal && (
        <Modal
          title={editShift ? "Editar turno" : "Agregar turno"}
          onClose={() => setShowShiftModal(false)}
          footer={
            <>
              <button className={styles.btnDiscard} onClick={() => setShowShiftModal(false)}>Cancelar</button>
              <button className={styles.btnSave} onClick={handleSaveShift} disabled={saving}>
                {saving ? "Guardando..." : editShift ? "Guardar cambios" : "Agregar turno"}
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 4 }}>Nombre del turno</label>
              <input
                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff" }}
                value={shiftName} onChange={(e) => setShiftName(e.target.value)} placeholder="ej. Turno almuerzo"
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 4 }}>Hora inicio</label>
                <input
                  type="time"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff" }}
                  value={shiftStart} onChange={(e) => setShiftStart(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 4 }}>Hora fin</label>
                <input
                  type="time"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff" }}
                  value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 4 }}>Intervalo (min)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff" }}
                  value={shiftInterval} onChange={(e) => setShiftInterval(Number(e.target.value))} min={5}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 4 }}>Máx. reservas</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #333", background: "#1a1a2e", color: "#fff" }}
                  value={shiftMax} onChange={(e) => setShiftMax(Number(e.target.value))} min={1}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
