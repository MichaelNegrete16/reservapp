"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, X } from "lucide-react";
import Stepper from "@/components/Stepper";
import { api } from "@/lib/api-client";
import styles from "./NuevaReserva.module.css";

const STEPS = [
  { num: 1, label: "Horario" },
  { num: 2, label: "Zona" },
  { num: 3, label: "Datos" },
  { num: 4, label: "Confirmar" },
];

const MOTIVOS = ["Cena casual", "Cumpleaños", "Aniversario", "Negocio", "Otro"];

interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface ZoneOption {
  id: string;
  name: string;
  description?: string;
}

export default function NuevaReservaPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [motivo, setMotivo] = useState("Cena casual");
  const [personas, setPersonas] = useState(2);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Availability data from API
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  // Fetch availability when date changes
  const fetchAvailability = useCallback(async (date: string) => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const res = await api.get<{ ok: boolean; data: { slots: AvailabilitySlot[]; zones: ZoneOption[] } }>(
        `/schedules/availability?date=${date}`
      );
      const availableSlots = res.data.slots
        .filter((s) => s.available)
        .map((s) => s.time);
      setTimeSlots(availableSlots);
      if (availableSlots.length > 0 && !selectedTime) {
        setSelectedTime(availableSlots[0]);
      }
      if (res.data.zones && res.data.zones.length > 0) {
        setZones(res.data.zones);
        if (!selectedZone) {
          setSelectedZone(res.data.zones[0].id);
        }
      }
    } catch {
      // Fallback: keep empty
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  // Also fetch zones on mount if not loaded via availability
  useEffect(() => {
    if (zones.length === 0) {
      api.get<{ ok: boolean; data: ZoneOption[] }>("/zones")
        .then((res) => {
          setZones(res.data.map((z) => ({ id: z.id, name: z.name, description: (z as unknown as { description?: string }).description })));
          if (res.data.length > 0 && !selectedZone) {
            setSelectedZone(res.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, []);

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 1) {
      if (!selectedDate) next.date = "Selecciona una fecha.";
      if (!selectedTime) next.time = "Selecciona una hora.";
    }
    if (step === 2) {
      if (!nombre.trim()) next.nombre = "El nombre es obligatorio.";
      if (!telefono.trim()) next.telefono = "El teléfono es obligatorio.";
      if (!email.trim()) next.email = "El correo es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Correo inválido.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/reservations", {
        fecha: selectedDate,
        hora: selectedTime,
        nombre,
        telefono,
        correo: email,
        personas,
        motivo,
        zoneId: selectedZone,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const zoneName = zones.find((z) => z.id === selectedZone)?.name || selectedZone;
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h2>¡Reserva confirmada!</h2>
          <p>{nombre} · {personas} personas · {selectedTime}</p>
          <p className={styles.successZone}>{zoneName}</p>
          <a href="/dashboard/reservas" className={styles.btnBack}>
            Volver a reservas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>🍴 ReservApp</div>
        <a href="/dashboard/reservas" className={styles.closeBtn}>
          <X size={20} />
        </a>
      </div>

      <Stepper steps={STEPS} current={step} />

      <div className={styles.content}>
        {/* Paso 1: Horario */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.twoCol}>
              <div>
                <h3 className={styles.sectionTitle}>Seleccionar fecha</h3>
                <div className={styles.calendar}>
                  <div className={styles.calendarHeader}>
                    <button className={styles.calNavBtn}>&lt;</button>
                    <span className={styles.calMonth}>{monthName}</span>
                    <button className={styles.calNavBtn}>&gt;</button>
                  </div>
                  <div className={styles.calGrid}>
                    {["D", "L", "M", "X", "J", "V", "S"].map((d, i) => (
                      <span key={d + i} className={styles.calDayLabel}>{d}</span>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const isSelected = selectedDate === dateStr;
                      const isPast = day < today.getDate();
                      return (
                        <button
                          key={day}
                          className={`${styles.calDay} ${isSelected ? styles.calDaySelected : ""} ${isPast ? styles.calDayPast : ""}`}
                          onClick={() => !isPast && setSelectedDate(dateStr)}
                          disabled={isPast}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errors.date && <p style={{ color: "#e53935", fontSize: 13, margin: "8px 0 0" }}>{errors.date}</p>}

                <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>
                  Hora de llegada
                </h3>
                {loadingSlots ? (
                  <div style={{ color: "#aaa", fontSize: 13, padding: "8px 0" }}>Cargando horarios disponibles...</div>
                ) : timeSlots.length > 0 ? (
                  <div className={styles.timeSlots}>
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        className={`${styles.timeChip} ${selectedTime === t ? styles.timeChipActive : ""}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div style={{ color: "#aaa", fontSize: 13, padding: "8px 0" }}>No hay horarios disponibles para esta fecha.</div>
                ) : (
                  <div style={{ color: "#aaa", fontSize: 13, padding: "8px 0" }}>Selecciona una fecha para ver horarios disponibles.</div>
                )}
                {errors.time && <p style={{ color: "#e53935", fontSize: 13, margin: "8px 0 0" }}>{errors.time}</p>}
              </div>

              <div>
                <h3 className={styles.sectionTitle}>Seleccionar zona</h3>
                <div className={styles.zoneCards}>
                  {zones.map((z) => (
                    <div
                      key={z.id}
                      className={`${styles.zoneCard} ${selectedZone === z.id ? styles.zoneCardActive : ""}`}
                      onClick={() => setSelectedZone(z.id)}
                    >
                      <div className={styles.zoneImgPlaceholder} />
                      <div className={styles.zoneInfo}>
                        <span className={styles.zoneName}>{z.name}</span>
                        <span className={styles.zoneDesc}>{z.description || ""}</span>
                        {selectedZone === z.id && (
                          <span className={styles.zoneSelected}>✓ SELECCIONADO</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Datos del cliente */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h3 className={styles.sectionTitle}>Datos del cliente</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>NOMBRE COMPLETO</label>
                <input
                  className={`${styles.input} ${errors.nombre ? styles.inputError : ""}`}
                  placeholder="Juan Pérez"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: "" })); }}
                />
                {errors.nombre && <span className={styles.fieldError}>{errors.nombre}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>TELÉFONO</label>
                <input
                  className={`${styles.input} ${errors.telefono ? styles.inputError : ""}`}
                  placeholder="+57 300 000 0000"
                  value={telefono}
                  onChange={(e) => { setTelefono(e.target.value); setErrors((p) => ({ ...p, telefono: "" })); }}
                />
                {errors.telefono && <span className={styles.fieldError}>{errors.telefono}</span>}
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>CORREO ELECTRÓNICO</label>
                <input
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>DOCUMENTO</label>
                <input
                  className={styles.input}
                  placeholder="Cédula / Pasaporte"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>MOTIVO</label>
                <select
                  className={styles.input}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className={styles.sectionTitle} style={{ marginTop: 24 }}>
              Número de personas
            </h3>
            <div className={styles.personasSelector}>
              <button
                className={styles.personasBtn}
                onClick={() => setPersonas(Math.max(1, personas - 1))}
              >
                −
              </button>
              <span className={styles.personasCount}>{personas}</span>
              <button
                className={styles.personasBtn}
                onClick={() => setPersonas(Math.min(20, personas + 1))}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Resumen */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.sectionTitle}>Resumen de la reserva</h3>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Fecha</span>
                <span className={styles.summaryValue}>{selectedDate || "No seleccionada"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Hora</span>
                <span className={styles.summaryValue}>{selectedTime}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Zona</span>
                <span className={styles.summaryValue}>
                  {zones.find((z) => z.id === selectedZone)?.name || selectedZone}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Personas</span>
                <span className={styles.summaryValue}>{personas} personas</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Cliente</span>
                <span className={styles.summaryValue}>{nombre || "No indicado"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Teléfono</span>
                <span className={styles.summaryValue}>{telefono || "No indicado"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Correo</span>
                <span className={styles.summaryValue}>{email || "No indicado"}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Motivo</span>
                <span className={styles.summaryValue}>{motivo}</span>
              </div>
            </div>
            {submitError && (
              <div style={{ color: "#e53935", fontSize: 14, marginTop: 12, padding: "8px 12px", background: "rgba(229,57,53,0.1)", borderRadius: 8 }}>
                {submitError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        {step > 1 ? (
          <button className={styles.btnBackNav} onClick={() => setStep(step - 1)}>
            <ArrowLeft size={16} /> Atrás
          </button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <button className={styles.btnNext} onClick={() => { if (validateStep()) setStep(step + 1); }}>
            Continuar <ArrowRight size={16} />
          </button>
        ) : (
          <button className={styles.btnComplete} onClick={() => { if (validateStep()) handleComplete(); }} disabled={submitting}>
            {submitting ? "Creando reserva..." : "Confirmar reserva"} {!submitting && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
