"use client";

import { useState } from "react";
import { Minus, Plus, ArrowLeft, ArrowRight, X, CheckCircle } from "lucide-react";
import styles from "./Widget.module.css";

const TIME_SLOTS = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

const ZONES = [
  { id: "main", name: "Main Dining Hall", desc: "Indoor, lively atmosphere." },
  { id: "terrace", name: "Garden Terrace", desc: "Outdoor, quiet, pet friendly." },
  { id: "bar", name: "Bar Lounge", desc: "Casual high-top seating." },
];

const today = new Date();
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function WidgetPage() {
  const [step, setStep] = useState(1);
  const [personas, setPersonas] = useState(2);
  const [selectedDate, setSelectedDate] = useState<number | null>(6);
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedZone, setSelectedZone] = useState("main");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [done, setDone] = useState(false);

  const STEPS = 4;
  const pct = Math.round((step / STEPS) * 100);

  const handleComplete = () => setDone(true);

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>🍴</div>
          </div>
          <div className={styles.successIcon}><CheckCircle size={64} /></div>
          <h2 className={styles.successTitle}>Reservation Confirmed!</h2>
          <p className={styles.successInfo}>{nombre} · {personas} people · {selectedTime}</p>
          <p className={styles.successInfo}>{ZONES.find((z) => z.id === selectedZone)?.name}</p>
          <button className={styles.btnDone} onClick={() => { setDone(false); setStep(1); }}>
            Make another reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>🍴</div>
        </div>
        <h1 className={styles.restaurantName}>Le Bistrot Moderne</h1>
        <p className={styles.restaurantInfo}>Paris, France · reservapp.com/r/le-bistrot</p>

        {/* Progress */}
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>STEP {step} OF {STEPS}</span>
          <span className={styles.progressPct}>{pct}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>

        {/* Step 1: People + Date + Time */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>How many people?</h3>
            <div className={styles.personasRow}>
              <button className={styles.countBtn} onClick={() => setPersonas(Math.max(1, personas - 1))}>
                <Minus size={16} />
              </button>
              <span className={styles.personasCount}>{personas}</span>
              <button className={`${styles.countBtn} ${styles.countBtnActive}`} onClick={() => setPersonas(Math.min(20, personas + 1))}>
                <Plus size={16} />
              </button>
              <span className={styles.tableHint}>👥 Standard Table</span>
            </div>

            <h3 className={styles.stepQuestion} style={{ marginTop: 20 }}>Select Date</h3>
            <div className={styles.calendar}>
              <div className={styles.calHeader}>
                <button className={styles.calNavBtn}>‹</button>
                <span className={styles.calMonth}>{monthName}</span>
                <button className={styles.calNavBtn}>›</button>
              </div>
              <div className={styles.calGrid}>
                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                  <span key={d} className={styles.calDayLabel}>{d}</span>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isPast = day < today.getDate();
                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      className={`${styles.calDay} ${selectedDate === day ? styles.calDaySelected : ""} ${isPast ? styles.calDayPast : ""}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <h3 className={styles.stepQuestion} style={{ marginTop: 20 }}>Available Times</h3>
            <div className={styles.timeSlots}>
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  className={`${styles.timeChip} ${selectedTime === t ? styles.timeChipActive : ""}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Zone */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Choose your seating area</h3>
            {ZONES.map((z) => (
              <div
                key={z.id}
                className={`${styles.zoneCard} ${selectedZone === z.id ? styles.zoneCardActive : ""}`}
                onClick={() => setSelectedZone(z.id)}
              >
                <div className={styles.zoneImg} />
                <div className={styles.zoneInfo}>
                  <span className={styles.zoneName}>{z.name}</span>
                  <span className={styles.zoneDesc}>{z.desc}</span>
                </div>
                <div className={`${styles.zoneRadio} ${selectedZone === z.id ? styles.zoneRadioActive : ""}`} />
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Your information</h3>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="John Doe" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input className={styles.input} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Special requests (optional)</label>
                <textarea className={styles.textarea} value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className={styles.stepContent}>
            <h3 className={styles.stepQuestion}>Confirm your reservation</h3>
            <div className={styles.summary}>
              {[
                ["Date", selectedDate ? `${today.toLocaleDateString("en-US", { month: "long" })} ${selectedDate}` : "—"],
                ["Time", selectedTime],
                ["People", `${personas} guests`],
                ["Zone", ZONES.find((z) => z.id === selectedZone)?.name ?? ""],
                ["Name", nombre || "—"],
                ["Phone", telefono || "—"],
                ["Email", email || "—"],
              ].map(([label, value]) => (
                <div key={label} className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{label}</span>
                  <span className={styles.summaryValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.cardFooter}>
          {step > 1 ? (
            <button className={styles.btnBack} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} /> Cancel
            </button>
          ) : (
            <button className={styles.btnBack}>
              <X size={15} /> Cancel
            </button>
          )}

          {step < 4 ? (
            <button className={styles.btnContinue} onClick={() => setStep(step + 1)}>
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button className={styles.btnContinue} onClick={handleComplete}>
              Confirm Reservation <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
