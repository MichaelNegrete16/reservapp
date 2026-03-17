"use client";

import { useState } from "react";
import { Plus, Pencil, X } from "lucide-react";
import Toggle from "@/components/Toggle";
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

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const INITIAL_TURNOS: Turno[] = [
  { id: "t1", name: "Turno almuerzo", startTime: "12:00", endTime: "16:00", interval: 30, maxReservations: 20, active: true },
  { id: "t2", name: "Turno cena", startTime: "18:00", endTime: "23:00", interval: 15, maxReservations: 15, active: true },
];

const HOLIDAYS_INIT = [
  { id: "h1", label: "Dic 25 · Navidad" },
  { id: "h2", label: "Ene 1 · Año nuevo" },
  { id: "h3", label: "Dic 31 · Nochevieja" },
];

export default function HorariosPage() {
  const [turnos, setTurnos] = useState<Turno[]>(INITIAL_TURNOS);
  const [openDays, setOpenDays] = useState<boolean[]>([true, true, true, true, true, true, false]);
  const [holidays, setHolidays] = useState(HOLIDAYS_INIT);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(24);
  const [hasChanges, setHasChanges] = useState(true);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const toggleDay = (i: number) => {
    const next = [...openDays];
    next[i] = !next[i];
    setOpenDays(next);
    setHasChanges(true);
  };

  const removeHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const addHoliday = () => {
    if (selectedCalDay) {
      const label = `${today.toLocaleDateString("es-CO", { month: "short" })} ${selectedCalDay} · Fecha personalizada`;
      setHolidays((prev) => [...prev, { id: `h${Date.now()}`, label }]);
    }
  };

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
                <button className={styles.editBtn}><Pencil size={14} /></button>
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
          <button className={styles.addTurnoBtn} onClick={() => setHasChanges(true)}>
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
          </div>

          <div className={styles.closuresPanel}>
            <h4 className={styles.calPanelTitle}>Próximos cierres</h4>
            <div className={styles.holidayChips}>
              {holidays.map((h) => (
                <span key={h.id} className={styles.holidayChip}>
                  {h.label}
                  <button className={styles.holidayRemove} onClick={() => removeHoliday(h.id)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button className={styles.addCustomBtn} onClick={addHoliday}>
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

      {/* Bottom Bar */}
      {hasChanges && (
        <div className={styles.bottomBar}>
          <div className={styles.changesNote}>
            <span className={styles.changesLabel}>ESTADO</span>
            <span className={styles.changesText}>Cambios sin guardar en bloques de reserva</span>
          </div>
          <div className={styles.bottomActions}>
            <button className={styles.btnDiscard} onClick={() => setHasChanges(false)}>Descartar</button>
            <button className={styles.btnSave} onClick={() => setHasChanges(false)}>Guardar cambios</button>
          </div>
        </div>
      )}
    </div>
  );
}
