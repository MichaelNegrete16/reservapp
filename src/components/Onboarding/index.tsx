"use client";

import { useState, useEffect } from "react";
import { Check, MapPin, LayoutGrid, Clock, Link2, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { getMe, type AuthUser } from "@/lib/auth";
import styles from "./Onboarding.module.css";

interface Zone { id: string; name: string; type: string; capacity: number; }
interface Table { id: string; number: number; shape: string; capacity: number; zoneId: string; }
interface Shift { id: string; name: string; startTime: string; endTime: string; interval: number; maxReservations: number; }

const ZONE_TYPES = [
  { value: "interior", label: "Interior", emoji: "🏠" },
  { value: "exterior", label: "Exterior", emoji: "🌿" },
  { value: "eventos", label: "Eventos", emoji: "🎉" },
  { value: "vip", label: "VIP", emoji: "⭐" },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Zones
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState("interior");
  const [zoneCapacity, setZoneCapacity] = useState(30);
  const [savingZone, setSavingZone] = useState(false);

  // Step 2: Tables
  const [tables, setTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [tableCapacity, setTableCapacity] = useState(4);
  const [tableZoneId, setTableZoneId] = useState("");
  const [tableShape, setTableShape] = useState("round");
  const [savingTable, setSavingTable] = useState(false);

  // Step 3: Shifts
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftName, setShiftName] = useState("Turno almuerzo");
  const [shiftStart, setShiftStart] = useState("12:00");
  const [shiftEnd, setShiftEnd] = useState("16:00");
  const [shiftInterval, setShiftInterval] = useState(30);
  const [shiftMax, setShiftMax] = useState(15);
  const [savingShift, setSavingShift] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const me = await getMe();
        setUser(me);
        const [zonesRes, tablesRes, shiftsRes] = await Promise.all([
          api.get<{ data: Zone[] }>("/zones"),
          api.get<{ data: Table[] }>("/tables"),
          api.get<{ data: { shifts: Shift[] } }>("/schedules"),
        ]);
        setZones(zonesRes.data ?? []);
        setTables(tablesRes.data ?? []);
        setShifts(shiftsRes.data?.shifts ?? []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    init();
  }, []);

  const slug = user?.restaurant?.slug ?? "";
  const widgetUrl = typeof window !== "undefined" ? `${window.location.origin}/r/${slug}` : `https://reservapp.com/r/${slug}`;

  const addZone = async () => {
    if (!zoneName.trim()) return;
    setSavingZone(true);
    try {
      const res = await api.post<{ data: Zone }>("/zones", { name: zoneName, type: zoneType, capacity: zoneCapacity });
      setZones((prev) => [...prev, res.data]);
      setZoneName("");
      setZoneCapacity(30);
    } catch { /* ignore */ }
    finally { setSavingZone(false); }
  };

  const removeZone = async (id: string) => {
    try {
      await api.del(`/zones/${id}`);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch { /* ignore */ }
  };

  const addTable = async () => {
    if (!tableZoneId) return;
    setSavingTable(true);
    try {
      const res = await api.post<{ data: Table }>("/tables", { number: tableNumber, capacity: tableCapacity, zoneId: tableZoneId, shape: tableShape, x: Math.random() * 300, y: Math.random() * 200 });
      setTables((prev) => [...prev, res.data]);
      setTableNumber(tableNumber + 1);
    } catch { /* ignore */ }
    finally { setSavingTable(false); }
  };

  const removeTable = async (id: string) => {
    try {
      await api.del(`/tables/${id}`);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch { /* ignore */ }
  };

  const addShift = async () => {
    if (!shiftName.trim()) return;
    setSavingShift(true);
    try {
      const res = await api.post<{ data: Shift }>("/schedules/shifts", { name: shiftName, startTime: shiftStart, endTime: shiftEnd, interval: shiftInterval, maxReservations: shiftMax });
      setShifts((prev) => [...prev, res.data]);
      setShiftName("Turno cena");
      setShiftStart("18:00");
      setShiftEnd("23:00");
    } catch { /* ignore */ }
    finally { setSavingShift(false); }
  };

  const removeShift = async (id: string) => {
    try {
      await api.del(`/schedules/shifts/${id}`);
      setShifts((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  const markOnboardingComplete = async () => {
    try {
      await api.patch("/restaurants/me/config", { config: { onboardingCompleted: true } });
    } catch { /* ignore */ }
    onComplete();
  };

  const STEPS = [
    { icon: MapPin, label: "Zonas", desc: "Define las áreas de tu restaurante" },
    { icon: LayoutGrid, label: "Mesas", desc: "Agrega mesas a cada zona" },
    { icon: Clock, label: "Horarios", desc: "Configura turnos de servicio" },
    { icon: Link2, label: "Tu link", desc: "Comparte con tus clientes" },
  ];

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.card} style={{ textAlign: "center", padding: 60 }}>
          <Loader2 size={40} className={styles.spinner} />
          <p style={{ color: "#888", marginTop: 16 }}>Preparando tu espacio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>¡Bienvenido a Chocoso! 🍫</h1>
            <p className={styles.subtitle}>Configura tu restaurante en unos minutos</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={`${styles.stepItem} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}>
              <div className={styles.stepCircle}>
                {i < step ? <Check size={14} /> : <s.icon size={14} />}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.body}>
          {/* Step 0: Zones */}
          {step === 0 && (
            <>
              <h2 className={styles.stepTitle}>Define las zonas de tu restaurante</h2>
              <p className={styles.stepDesc}>Las zonas son las áreas donde se ubican tus mesas (Salón, Terraza, Barra, VIP, etc.)</p>

              <div className={styles.formRow}>
                <input className={styles.input} placeholder="Nombre de la zona" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                <select className={styles.select} value={zoneType} onChange={(e) => setZoneType(e.target.value)}>
                  {ZONE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
                <input className={styles.inputSmall} type="number" min={1} placeholder="Cap." value={zoneCapacity} onChange={(e) => setZoneCapacity(Number(e.target.value))} />
                <button className={styles.btnAdd} onClick={addZone} disabled={savingZone || !zoneName.trim()}>
                  <Plus size={16} />
                </button>
              </div>

              <div className={styles.itemList}>
                {zones.map((z) => (
                  <div key={z.id} className={styles.item}>
                    <span>{ZONE_TYPES.find((t) => t.value === z.type)?.emoji ?? "📍"} {z.name}</span>
                    <span className={styles.itemMeta}>{z.capacity} personas</span>
                    <button className={styles.btnRemove} onClick={() => removeZone(z.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
                {zones.length === 0 && <p className={styles.empty}>Agrega al menos una zona para continuar</p>}
              </div>
            </>
          )}

          {/* Step 1: Tables */}
          {step === 1 && (
            <>
              <h2 className={styles.stepTitle}>Agrega mesas a tus zonas</h2>
              <p className={styles.stepDesc}>Después podrás arrastrarlas en el mapa visual desde el módulo de Mesas.</p>

              <div className={styles.formRow}>
                <input className={styles.inputSmall} type="number" min={1} placeholder="#" value={tableNumber} onChange={(e) => setTableNumber(Number(e.target.value))} />
                <select className={styles.select} value={tableZoneId} onChange={(e) => setTableZoneId(e.target.value)}>
                  <option value="">Zona...</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
                <select className={styles.select} value={tableShape} onChange={(e) => setTableShape(e.target.value)}>
                  <option value="round">⚪ Redonda</option>
                  <option value="square">⬜ Cuadrada</option>
                </select>
                <input className={styles.inputSmall} type="number" min={2} max={12} placeholder="Cap." value={tableCapacity} onChange={(e) => setTableCapacity(Number(e.target.value))} />
                <button className={styles.btnAdd} onClick={addTable} disabled={savingTable || !tableZoneId}>
                  <Plus size={16} />
                </button>
              </div>

              <div className={styles.itemList}>
                {tables.map((t) => (
                  <div key={t.id} className={styles.item}>
                    <span>{t.shape === "round" ? "⚪" : "⬜"} Mesa {t.number}</span>
                    <span className={styles.itemMeta}>{t.capacity} pers. · {zones.find((z) => z.id === t.zoneId)?.name ?? "?"}</span>
                    <button className={styles.btnRemove} onClick={() => removeTable(t.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
                {tables.length === 0 && <p className={styles.empty}>Agrega al menos una mesa para continuar</p>}
              </div>
            </>
          )}

          {/* Step 2: Shifts */}
          {step === 2 && (
            <>
              <h2 className={styles.stepTitle}>Configura tus turnos de servicio</h2>
              <p className={styles.stepDesc}>Los turnos definen los horarios en los que tus clientes pueden reservar.</p>

              <div className={styles.formRow}>
                <input className={styles.input} placeholder="Nombre del turno" value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
                <input className={styles.inputSmall} type="time" value={shiftStart} onChange={(e) => setShiftStart(e.target.value)} />
                <input className={styles.inputSmall} type="time" value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)} />
                <button className={styles.btnAdd} onClick={addShift} disabled={savingShift || !shiftName.trim()}>
                  <Plus size={16} />
                </button>
              </div>

              <div className={styles.itemList}>
                {shifts.map((s) => (
                  <div key={s.id} className={styles.item}>
                    <span>🕐 {s.name}</span>
                    <span className={styles.itemMeta}>{s.startTime} - {s.endTime} · cada {s.interval}min</span>
                    <button className={styles.btnRemove} onClick={() => removeShift(s.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
                {shifts.length === 0 && <p className={styles.empty}>Agrega al menos un turno para continuar</p>}
              </div>
            </>
          )}

          {/* Step 3: Link */}
          {step === 3 && (
            <>
              <h2 className={styles.stepTitle}>¡Todo listo! 🎉</h2>
              <p className={styles.stepDesc}>Este es el link que tus clientes usarán para hacer reservas:</p>

              <div className={styles.linkBox}>
                <span className={styles.linkIcon}>🔗</span>
                <code className={styles.linkUrl}>{widgetUrl}</code>
                <button className={styles.btnCopy} onClick={() => { navigator.clipboard.writeText(widgetUrl); }}>
                  Copiar
                </button>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryNumber}>{zones.length}</span>
                  <span className={styles.summaryLabel}>Zonas</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryNumber}>{tables.length}</span>
                  <span className={styles.summaryLabel}>Mesas</span>
                </div>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryNumber}>{shifts.length}</span>
                  <span className={styles.summaryLabel}>Turnos</span>
                </div>
              </div>

              <p className={styles.tip}>
                Puedes modificar todo esto después desde el menú lateral. Comparte tu link en redes sociales, tu web o WhatsApp.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step > 0 && (
            <button className={styles.btnBack} onClick={() => setStep(step - 1)}>
              Atrás
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button
              className={styles.btnNext}
              disabled={(step === 0 && zones.length === 0) || (step === 1 && tables.length === 0) || (step === 2 && shifts.length === 0)}
              onClick={() => setStep(step + 1)}
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button className={styles.btnFinish} onClick={markOnboardingComplete}>
              Ir al dashboard <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
