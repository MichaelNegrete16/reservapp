"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, ArrowLeft, ArrowRight, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import styles from "./Widget.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface RestaurantInfo {
  name: string;
  slug: string;
  address?: string;
  logoUrl?: string;
  config?: { appearance?: { primaryColor?: string } };
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

interface ZoneOption {
  id: string;
  name: string;
  description?: string;
  available?: boolean;
}

async function fetchPublic<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Error ${res.status}`);
  }
  return res.json();
}

async function postPublic<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Error ${res.status}`);
  }
  return res.json();
}

export default function WidgetPage() {
  const { slug } = useParams<{ slug: string }>();

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState(1);
  const [personas, setPersonas] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Calendar state
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const todayDate = new Date();

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday = 0
  const monthLabel = new Date(calYear, calMonth).toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const STEPS = 4;
  const pct = Math.round((step / STEPS) * 100);
  const primaryColor = restaurant?.config?.appearance?.primaryColor ?? "#e65100";

  // Fetch restaurant info
  useEffect(() => {
    if (!slug) return;
    setLoadingInfo(true);
    fetchPublic<{ ok: boolean; data: RestaurantInfo }>(`/restaurants/public/${slug}/info`)
      .then((res) => setRestaurant(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingInfo(false));

    // Fetch zones
    fetchPublic<{ ok: boolean; data: ZoneOption[] }>(`/restaurants/public/${slug}/zones`)
      .then((res) => setZones(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, [slug]);

  // Fetch availability when date changes
  useEffect(() => {
    if (!slug || !selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    fetchPublic<{ ok: boolean; data: { slots: unknown; zones?: ZoneOption[] } }>(
      `/public/${slug}/availability?date=${selectedDate}&people=${personas}`
    )
      .then((res) => {
        // slots can be an object { "19:00": 1 } or array [{ time, available }]
        const raw = res.data?.slots;
        if (Array.isArray(raw)) {
          setSlots(raw);
        } else if (raw && typeof raw === "object") {
          // count = reservas existentes en ese slot. available si aún no está saturado (asumimos max 20 por defecto)
          setSlots(Object.entries(raw as Record<string, number>).map(([time, count]) => ({ time, available: count < 20 })));
        } else {
          setSlots([]);
        }
        // zones are loaded separately from /restaurants/public/:slug/zones
      })
      .catch(() => {
        // Fallback: fetch zones separately
        fetchPublic<{ ok: boolean; data: ZoneOption[] }>(`/restaurants/public/${slug}/info`)
          .then(() => {})
          .catch(() => {});
      })
      .finally(() => setLoadingSlots(false));
  }, [slug, selectedDate, personas]);

  const handleDateClick = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime("");
    setSelectedZone("");
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  };

  const canContinueStep1 = selectedDate && selectedTime;
  const canContinueStep3 = nombre.trim() && telefono.trim();

  const handleComplete = async () => {
    setSubmitting(true);
    setError("");
    try {
      await postPublic(`/public/${slug}/book`, {
        date: selectedDate,
        time: selectedTime,
        people: personas,
        zoneId: selectedZone || undefined,
        name: nombre,
        phone: telefono,
        email: email || undefined,
        notes: notas || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const selectedZoneName = zones.find((z) => z.id === selectedZone)?.name ?? "";

  // Loading state
  if (loadingInfo) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: "center", padding: "60px 20px" }}>
          <Loader2 size={40} style={{ animation: "spin 1s linear infinite", color: "#c2185b" }} />
          <p style={{ color: "#888", marginTop: 16 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound || !restaurant) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: "center", padding: "60px 20px" }}>
          <AlertCircle size={48} style={{ color: "#d32f2f" }} />
          <h2 style={{ margin: "16px 0 8px", fontSize: 20 }}>Restaurante no encontrado</h2>
          <p style={{ color: "#888" }}>El enlace que usaste no es válido o el restaurante ya no está activo.</p>
        </div>
      </div>
    );
  }

  // Success
  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>🍴</div>
          </div>
          <div className={styles.successIcon}><CheckCircle size={64} style={{ color: primaryColor }} /></div>
          <h2 className={styles.successTitle}>¡Reserva confirmada!</h2>
          <p className={styles.successInfo}>{nombre} · {personas} personas · {selectedTime}</p>
          <p className={styles.successInfo}>{selectedDateFormatted}</p>
          {selectedZoneName && <p className={styles.successInfo}>{selectedZoneName}</p>}
          <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
            Te enviaremos un recordatorio antes de tu reserva.
          </p>
          <button className={styles.btnDone} style={{ background: primaryColor }} onClick={() => { setDone(false); setStep(1); setNombre(""); setTelefono(""); setEmail(""); setNotas(""); }}>
            Hacer otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>🍴</div>
        </div>
        <h1 className={styles.restaurantName}>{restaurant.name}</h1>
        <p className={styles.restaurantInfo}>
          {restaurant.address ?? ""} · reservapp.com/r/{restaurant.slug}
        </p>

        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>PASO {step} DE {STEPS}</span>
          <span className={styles.progressPct}>{pct}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%`, background: primaryColor }} />
        </div>

        {/* Step 1: People + Date + Time */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>¿Cuántas personas?</h3>
            <div className={styles.personasRow}>
              <button className={styles.countBtn} onClick={() => setPersonas(Math.max(1, personas - 1))}>
                <Minus size={16} />
              </button>
              <span className={styles.personasCount}>{personas}</span>
              <button className={`${styles.countBtn} ${styles.countBtnActive}`} style={{ background: primaryColor }} onClick={() => setPersonas(Math.min(20, personas + 1))}>
                <Plus size={16} />
              </button>
              <span className={styles.tableHint}>👥 {personas <= 2 ? "Mesa íntima" : personas <= 6 ? "Mesa estándar" : "Mesa grande"}</span>
            </div>

            <h3 className={styles.stepQuestion} style={{ marginTop: 20 }}>Seleccionar fecha</h3>
            <div className={styles.calendar}>
              <div className={styles.calHeader}>
                <button className={styles.calNavBtn} onClick={handlePrevMonth}>‹</button>
                <span className={styles.calMonth}>{monthLabel}</span>
                <button className={styles.calNavBtn} onClick={handleNextMonth}>›</button>
              </div>
              <div className={styles.calGrid}>
                {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => (
                  <span key={d} className={styles.calDayLabel}>{d}</span>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPast = new Date(calYear, calMonth, day) < new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      className={`${styles.calDay} ${selectedDate === dateStr ? styles.calDaySelected : ""} ${isPast ? styles.calDayPast : ""}`}
                      style={selectedDate === dateStr ? { background: primaryColor } : undefined}
                      onClick={() => handleDateClick(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <>
                <h3 className={styles.stepQuestion} style={{ marginTop: 20 }}>Horarios disponibles</h3>
                {loadingSlots ? (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#888" }} />
                  </div>
                ) : slots.filter((s) => s.available).length > 0 ? (
                  <div className={styles.timeSlots}>
                    {slots.filter((s) => s.available).map((s) => (
                      <button
                        key={s.time}
                        className={`${styles.timeChip} ${selectedTime === s.time ? styles.timeChipActive : ""}`}
                        style={selectedTime === s.time ? { background: primaryColor, borderColor: primaryColor } : undefined}
                        onClick={() => setSelectedTime(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: 16 }}>
                    No hay horarios disponibles para esta fecha. Intenta otro día.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Zone */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Elige tu área de asientos</h3>
            {zones.length > 0 ? zones.map((z) => (
              <div
                key={z.id}
                className={`${styles.zoneCard} ${selectedZone === z.id ? styles.zoneCardActive : ""}`}
                style={selectedZone === z.id ? { borderColor: primaryColor } : undefined}
                onClick={() => setSelectedZone(z.id)}
              >
                <div className={styles.zoneImg} />
                <div className={styles.zoneInfo}>
                  <span className={styles.zoneName}>{z.name}</span>
                  <span className={styles.zoneDesc}>{z.description ?? ""}</span>
                </div>
                <div
                  className={`${styles.zoneRadio} ${selectedZone === z.id ? styles.zoneRadioActive : ""}`}
                  style={selectedZone === z.id ? { borderColor: primaryColor, background: primaryColor } : undefined}
                />
              </div>
            )) : (
              <p style={{ color: "#999", fontSize: 14, textAlign: "center", padding: 20 }}>
                No hay zonas configuradas. Puedes continuar sin seleccionar zona.
              </p>
            )}
          </div>
        )}

        {/* Step 3: Guest info */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Tus datos</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre completo *</label>
                <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Pérez" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Teléfono *</label>
                <input className={styles.input} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+57 300 000 0000" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Correo electrónico</label>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@ejemplo.com" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Peticiones especiales (opcional)</label>
                <textarea className={styles.textarea} value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Confirma tu reserva</h3>
            {error && (
              <div style={{ background: "#ffebee", color: "#c62828", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}
            <div className={styles.summary}>
              {[
                ["Fecha", selectedDateFormatted],
                ["Hora", selectedTime],
                ["Personas", `${personas} comensales`],
                ["Zona", selectedZoneName || "Sin preferencia"],
                ["Nombre", nombre || "—"],
                ["Teléfono", telefono || "—"],
                ["Correo", email || "—"],
              ].map(([label, value]) => (
                <div key={label} className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{label}</span>
                  <span className={styles.summaryValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.cardFooter}>
          {step > 1 ? (
            <button className={styles.btnBack} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} /> Atrás
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              className={styles.btnContinue}
              style={{ background: primaryColor }}
              disabled={(step === 1 && !canContinueStep1) || (step === 3 && !canContinueStep3)}
              onClick={() => setStep(step + 1)}
            >
              Continuar <ArrowRight size={15} />
            </button>
          ) : (
            <button
              className={styles.btnContinue}
              style={{ background: primaryColor }}
              disabled={submitting}
              onClick={handleComplete}
            >
              {submitting ? "Reservando..." : "Confirmar reserva"} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
